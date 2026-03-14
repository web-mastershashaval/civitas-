from .models import Rule, RuleDecision, Discussion, SubBoard, Board, Community, Report, User
from django.db.models import Q
from datetime import datetime, timezone, timedelta

class RulesService:
    @staticmethod
    def evaluate_action(user, action, scope_type, scope_id, payload=None):
        """
        The core evaluation pipeline. Platform rules are evaluated first and always win.
        """
        # 0. Check if user is currently muted
        if user.is_muted and user.mute_until:
            if datetime.now(timezone.utc) < user.mute_until:
                return {
                    "allowed": False,
                    "result": "BLOCKED",
                    "message": f"You are temporarily muted until {user.mute_until.strftime('%Y-%m-%d %H:%M UTC')}."
                }
            else:
                # Mute period has expired, clear the mute
                user.is_muted = False
                user.mute_until = None
                user.save()
        
        # 1. Resolve Scope Chain
        scope_chain = RulesService.resolve_scope_chain(scope_type, scope_id)

        # 2. Fetch Applicable Rules
        q_filter = Q()
        for scope in scope_chain:
            q_filter |= Q(scope_type=scope['type'], scope_id=scope['id'])

        rules = Rule.objects.filter(
            q_filter,
            action=action,
            role=user.role,
            active=True
        )

        if not rules.exists():
            RulesService.log_decision(user, action, scope_type, scope_id, 'ALLOWED')
            return {"allowed": True, "result": "ALLOWED"}

        # 3. Priority Logic: Constitutional (is_system) rules ALWAYS win.
        # Then we sort by specificity (Low priority to Platform Configurable -> Higher to Discussion).
        # HOWEVER, constitutional blocks are absolute.
        
        system_rules = rules.filter(is_system=True)
        community_rules = rules.filter(is_system=False)

        # 4. Check Constitutional Rules First
        for rule in system_rules:
            evaluation = RulesService.check_conditions(rule, user, action, payload)
            if not evaluation['allowed']:
                # Constitution always wins. BLOCK immediately.
                RulesService.log_decision(user, action, scope_type, scope_id, evaluation['result'], rule, evaluation.get('message'))
                return evaluation

        # 5. Evaluate Community/Board Rules (Specific wins, Deny wins)
        priority_map = {
            'DISCUSSION': 5,
            'SUB_BOARD': 4,
            'BOARD': 3,
            'COMMUNITY': 2,
            'PLATFORM': 1
        }
        sorted_community_rules = sorted(community_rules, key=lambda x: priority_map[x.scope_type], reverse=True)

        for rule in sorted_community_rules:
            evaluation = RulesService.check_conditions(rule, user, action, payload)
            if not evaluation['allowed']:
                RulesService.log_decision(user, action, scope_type, scope_id, evaluation['result'], rule, evaluation.get('message'))
                return evaluation

        # If all checks pass
        RulesService.log_decision(user, action, scope_type, scope_id, 'ALLOWED')
        return {"allowed": True, "result": "ALLOWED"}

    @staticmethod
    def resolve_scope_chain(scope_type, scope_id):
        chain = [{"type": "PLATFORM", "id": None}]
        curr_type = scope_type
        curr_id = scope_id

        while curr_id:
            chain.append({"type": curr_type, "id": str(curr_id)})
            
            try:
                if curr_type == 'DISCUSSION':
                    disc = Discussion.objects.get(id=curr_id)
                    curr_id = disc.sub_board.id
                    curr_type = 'SUB_BOARD'
                elif curr_type == 'SUB_BOARD':
                    sub = SubBoard.objects.get(id=curr_id)
                    curr_id = sub.board.id
                    curr_type = 'BOARD'
                elif curr_type == 'BOARD':
                    board = Board.objects.get(id=curr_id)
                    curr_id = board.community.id
                    curr_type = 'COMMUNITY'
                else:
                    curr_id = None
            except (Discussion.DoesNotExist, SubBoard.DoesNotExist, Board.DoesNotExist, ValueError):
                curr_id = None

        return chain

    @staticmethod
    def check_conditions(rule, user, action, payload):
        conditions = rule.conditions
        enforcement = rule.enforcement
        now = datetime.now(timezone.utc)

        # SR-15: Rate Abuse Protection (Day/Hour)
        if 'max_per_day' in conditions:
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            count = RuleDecision.objects.filter(
                user=user,
                action=action,
                result='ALLOWED',
                timestamp__gte=start_of_day
            ).count()

            if count >= conditions['max_per_day']:
                return {
                    "allowed": False,
                    "result": "BLOCKED",
                    "message": f"{rule.code}: {enforcement.get('message', 'Daily limit reached.')}"
                }

        if 'max_per_hour' in conditions:
            start_of_hour = now - timedelta(hours=1)
            count = RuleDecision.objects.filter(
                user=user,
                action=action,
                result='ALLOWED',
                timestamp__gte=start_of_hour
            ).count()

            if count >= conditions['max_per_hour']:
                return {
                    "allowed": False,
                    "result": "BLOCKED",
                    "message": f"{rule.code}: {enforcement.get('message', 'Hourly limit reached.')}"
                }
        # SR-18: Structured Posting (Content Rules)
        if conditions.get('requires_sources') and (not payload or not payload.get('sources')):
            return {
                "allowed": False,
                "result": "BLOCKED",
                "message": f"{rule.code}: Verification sources are required for this action as per platform standards."
            }

        # Handle other SR specific condition flags
        if conditions.get('requires_reason') and (not payload or not payload.get('reason')):
             return {
                "allowed": False,
                "result": "BLOCKED",
                "message": f"{rule.code}: A specific moderation reason must be provided for this action."
            }
        
        # Report Threshold Check (from Rule Builder)
        if 'max_reports' in conditions and payload and payload.get('object_id'):
            report_count = Report.objects.filter(
                content_type=payload.get('content_type', 'DISCUSSION'),
                object_id=payload.get('object_id'),
                status='PENDING'
            ).count()
            
            if report_count >= conditions['max_reports']:
                return {
                    "allowed": False,
                    "result": "BLOCKED",
                    "message": f"{rule.code}: {enforcement.get('message', 'Report threshold exceeded.')}"
                }
        
        # Member Maturity Check (from Rule Builder)
        if 'member_age' in conditions and conditions['member_age'] != 'any':
            account_age_days = (datetime.now(timezone.utc) - user.date_joined.replace(tzinfo=timezone.utc)).days
            
            if conditions['member_age'] == 'new' and account_age_days > 30:
                # This rule only applies to new members (< 30 days)
                pass  # Skip this rule for established members
            elif conditions['member_age'] == 'established' and account_age_days < 30:
                # This rule only applies to established members (>= 30 days)
                pass  # Skip this rule for new members

        # Context-Aware term scanning (BoardType based scanning)
        content_to_scan = payload.get('content') or payload.get('body') or payload.get('title')
        if content_to_scan:
            # We need to find the board context to check for disallowed terms
            # For simplicity, we assume the evaluate_action has passed enough info in payload or scope
            board_id = payload.get('board_id') or payload.get('board')
            if not board_id and payload.get('sub_board'):
                try:
                    board_id = SubBoard.objects.get(id=payload.get('sub_board')).board.id
                except SubBoard.DoesNotExist:
                    pass
            
            if board_id:
                try:
                    from .models import BoardTypeTerm
                    board = Board.objects.get(id=board_id)
                    if board.board_type:
                        disallowed_terms = BoardTypeTerm.objects.filter(
                            board_type=board.board_type,
                            term_type='DISALLOWED'
                        ).values_list('term', flat=True)
                        
                        lower_content = content_to_scan.lower()
                        for term in disallowed_terms:
                            if term.lower() in lower_content:
                                return {
                                    "allowed": False,
                                    "result": "BLOCKED",
                                    "message": f"Security Notice: This board ({board.board_type.name}) prohibits the use of '{term}'. Please refine your communication to align with board protocols."
                                }
                except Board.DoesNotExist:
                    pass

        return {"allowed": True, "result": "ALLOWED"}

    @staticmethod
    def log_decision(user, action, scope_type, scope_id, result, rule=None, reason=None):
        # Implementation of SR-12: Mandatory Rule Traceability
        RuleDecision.objects.create(
            user=user,
            action=action,
            scope_type=scope_type,
            scope_id=scope_id,
            result=result,
            rule=rule,
            reason=reason
        )

import logging
audit_logger = logging.getLogger('governance.audit')

class ReputationService:
    @staticmethod
    def adjust_reputation(user, delta, reason=None):
        """
        Adjust user reputation and log the change.
        """
        old_score = user.reputation_score
        user.reputation_score += delta
        user.save()
        
        audit_logger.info(
            f"AUDIT [REPUTATION_CHANGE]: User {user.username} (ID: {user.id}) "
            f"score {old_score} -> {user.reputation_score} (delta: {delta}). Reason: {reason}"
        )
        
        # Check for status changes if reputation drops too low?
        # Future: auto-mute if reputation < 0

class GovernanceTriggerService:
    @staticmethod
    def check_thresholds(content_type, object_id):
        """
        Check vote thresholds for a specific item and trigger actions.
        """
        from .models import Vote, Report, Discussion, Response, ModerationAction, Rule, User
        
        upvotes = Vote.objects.filter(content_type=content_type, object_id=object_id, vote_type='UP').count()
        downvotes = Vote.objects.filter(content_type=content_type, object_id=object_id, vote_type='DOWN').count()
        
        # Trigger 1: Auto-Flag (High Downvotes)
        if downvotes >= 5:
            # Check if already reported
            if not Report.objects.filter(content_type=content_type, object_id=object_id, reporter__role='SYSTEM').exists():
                system_user = User.objects.filter(role='SYSTEM').first()
                if system_user:
                    Report.objects.create(
                        reporter=system_user,
                        content_type=content_type,
                        object_id=object_id,
                        reason=f"System generated: High negative sentiment ({downvotes} downvotes).",
                        status='PENDING'
                    )
                    audit_logger.info(f"AUDIT [AUTO_FLAG]: {content_type} {object_id} flagged due to {downvotes} downvotes.")

        # Trigger 2: Reputation Bonus (High Upvotes)
        if upvotes >= 10:
            author = None
            if content_type == 'DISCUSSION':
                item = Discussion.objects.filter(id=object_id).first()
            else:
                item = Response.objects.filter(id=object_id).first()
            
            if item:
                author = item.author
                ReputationService.adjust_reputation(author, 5, reason=f"Content quality bonus: 10+ upvotes on {content_type}.")

        return {"upvotes": upvotes, "downvotes": downvotes}
