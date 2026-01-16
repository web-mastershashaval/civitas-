from .models import Rule, RuleDecision, Discussion, SubBoard, Board, Community
from django.db.models import Q
from datetime import datetime, timezone

class RulesService:
    @staticmethod
    def evaluate_action(user, action, scope_type, scope_id, payload=None):
        """
        The core evaluation pipeline. Platform rules are evaluated first and always win.
        """
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
                RulesService.log_decision(user, action, scope_type, scope_id, evaluation['result'], rule)
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
                RulesService.log_decision(user, action, scope_type, scope_id, evaluation['result'], rule)
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

        return {"allowed": True, "result": "ALLOWED"}

    @staticmethod
    def log_decision(user, action, scope_type, scope_id, result, rule=None):
        # Implementation of SR-12: Mandatory Rule Traceability
        RuleDecision.objects.create(
            user=user,
            action=action,
            scope_type=scope_type,
            scope_id=scope_id,
            result=result,
            rule=rule
        )
