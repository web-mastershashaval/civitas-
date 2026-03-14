import logging
from rest_framework import viewsets, permissions, status
from datetime import datetime, timezone
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response as DRFResponse
from .models import (
    User, Community, CommunityMember, Board, SubBoard, Discussion, Response, 
    Rule, RuleDecision, Follow, Notification, Report, ModerationAction, Appeal, Vote
)
from rest_framework.decorators import action
from .serializers import (
    UserSerializer, RegisterSerializer, CommunitySerializer, BoardSerializer, 
    SubBoardSerializer, DiscussionSerializer, ResponseSerializer, 
    RuleSerializer, RuleDecisionSerializer, CommunityMemberSerializer,
    FollowSerializer, NotificationSerializer, VoteSerializer
)

# Set up audit logger
audit_logger = logging.getLogger('governance.audit')

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return DRFResponse({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return DRFResponse({'status': 'all notifications marked as read'})

class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        content_type = request.data.get('content_type')
        object_id = request.data.get('object_id')
        
        if not content_type or not object_id:
            return DRFResponse({'detail': 'content_type and object_id are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        follow, created = Follow.objects.get_or_create(
            user=request.user,
            content_type=content_type,
            object_id=object_id
        )
        
        if not created:
            follow.delete()
            return DRFResponse({'status': 'unfollowed', 'following': False})
            
        return DRFResponse({'status': 'followed', 'following': True}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def status(self, request):
        content_type = request.query_params.get('content_type')
        object_id = request.query_params.get('object_id')
        
        if not content_type or not object_id:
            return DRFResponse({'detail': 'content_type and object_id are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        is_following = Follow.objects.filter(
            user=request.user,
            content_type=content_type,
            object_id=object_id
        ).exists()
        
        return DRFResponse({'following': is_following})
from .services import RulesService

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.action == 'register':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return DRFResponse(serializer.data)
            return DRFResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(request.user)
        return DRFResponse(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            audit_logger.info(f"AUDIT [USER_REGISTER]: New user registered: {user.username} (ID: {user.id})")
            return DRFResponse(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return DRFResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def complete_orientation(self, request):
        user = request.user
        user.has_completed_orientation = True
        user.save()
        audit_logger.info(f"AUDIT [ORIENTATION_COMPLETE]: User {user.username} completed governance orientation.")
        return DRFResponse({'status': 'orientation completed'})

class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        queryset = Community.objects.all()
        managed = self.request.query_params.get('managed')
        joined = self.request.query_params.get('joined')

        if managed == 'true' or joined == 'true':
            # return only communities where the user has an ACTIVE membership
            return queryset.filter(communitymember__user=self.request.user, communitymember__status='ACTIVE')
        
        return queryset

    def perform_create(self, serializer):
        community = serializer.save()
        # SR: Creator is automatically the first member/facilitator
        CommunityMember.objects.create(
            user=self.request.user,
            community=community,
            status='ACTIVE'
        )
        # Create default boards with unique refs
        Board.objects.create(name="Announcements", ref=f"announcements-{community.id}", community=community)
        Board.objects.create(name="General", ref=f"general-{community.id}", community=community)

    @action(detail=True, methods=['post'])
    def add_facilitator(self, request, pk=None):
        community = self.get_object()
        username = request.data.get('username')
        if not username:
            return DRFResponse({'detail': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return DRFResponse({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Add to community member if not exists
        member, created = CommunityMember.objects.get_or_create(user=user, community=community)
        
        # Determine if we should set status to ACTIVE (default is ACTIVE anyway)
        if member.status != 'ACTIVE':
            member.status = 'ACTIVE'
            member.save()

        # Promote role to FACILITATOR
        # NOTE: This promotes them globally as per current model design
        if user.role != 'FACILITATOR':
            old_role = user.role
            user.role = 'FACILITATOR'
            user.save()
            audit_logger.info(f"AUDIT [ROLE_UPGRADE]: User {user.username} promoted from {old_role} to FACILITATOR by {request.user.username} in community {community.name}")
        
        return DRFResponse({'status': 'facilitator added', 'username': user.username})

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        community = self.get_object()
        
        # Respect community access protocol
        status_to_assign = 'ACTIVE' if community.access_type == 'OPEN' else 'PENDING'
        
        member, created = CommunityMember.objects.get_or_create(
            user=request.user, 
            community=community,
            defaults={'status': status_to_assign}
        )
        
        if not created and member.status == 'REJECTED':
            # Allow re-applying if rejected? For now, keep it simple.
            member.status = status_to_assign
            member.save()
             
        return DRFResponse({
            'status': member.status.lower(), 
            'community': community.name,
            'detail': 'Your application is pending review' if status_to_assign == 'PENDING' else 'Joined successfully'
        })

    @action(detail=True, methods=['post'])
    def respond_to_application(self, request, pk=None):
        community = self.get_object()
        # Only facilitators can respond
        if not CommunityMember.objects.filter(user=request.user, community=community, user__role='FACILITATOR').exists():
            return DRFResponse({'detail': 'Only facilitators can manage applications'}, status=status.HTTP_403_FORBIDDEN)
            
        username = request.data.get('username')
        approve = request.data.get('approve') # Boolean
        
        if not username:
            return DRFResponse({'detail': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            member = CommunityMember.objects.get(user__username=username, community=community)
            member.status = 'ACTIVE' if approve else 'REJECTED'
            member.save()
            return DRFResponse({'status': member.status, 'username': username})
        except CommunityMember.DoesNotExist:
            return DRFResponse({'detail': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Board.objects.all()
        community_id = self.request.query_params.get('community')
        if community_id:
            queryset = queryset.filter(community_id=community_id)
        return queryset

    def get_object(self):
        obj = super().get_object()
        community_id = self.request.query_params.get('community')
        # Relax contextual check if community is not provided (facilitator direct entry)
        # But if it IS provided, validate it strictly.
        if community_id and str(obj.community.id) != community_id:
            from rest_framework.exceptions import NotFound
            raise NotFound("Board not found in this community context.")
        return obj

class SubBoardViewSet(viewsets.ModelViewSet):
    queryset = SubBoard.objects.all()
    serializer_class = SubBoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SubBoard.objects.all()
        community_id = self.request.query_params.get('community')
        board_id = self.request.query_params.get('board')
        
        if community_id:
            queryset = queryset.filter(board__community_id=community_id)
        if board_id:
            queryset = queryset.filter(board_id=board_id)
            
        return queryset

    def get_object(self):
        obj = super().get_object()
        community_id = self.request.query_params.get('community')
        if community_id and str(obj.board.community.id) != community_id:
            from rest_framework.exceptions import NotFound
            raise NotFound("Sub-board not found in this community context.")
        return obj

class DiscussionViewSet(viewsets.ModelViewSet):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Discussion.objects.all()
        community_id = self.request.query_params.get('community')
        sub_board_id = self.request.query_params.get('sub_board')

        if community_id:
            queryset = queryset.filter(sub_board__board__community_id=community_id)
        if sub_board_id:
            queryset = queryset.filter(sub_board_id=sub_board_id)
            
        return queryset

    def get_object(self):
        obj = super().get_object()
        community_id = self.request.query_params.get('community')
        if community_id and str(obj.sub_board.board.community.id) != community_id:
            from rest_framework.exceptions import NotFound
            raise NotFound("Discussion not found in this community context.")
        return obj

    def create(self, request, *args, **kwargs):
        # Governance Check
        eval_result = RulesService.evaluate_action(
            user=request.user,
            action='CREATE_DISCUSSION',
            scope_type='SUB_BOARD',
            scope_id=request.data.get('sub_board'),
            payload=request.data
        )

        if not eval_result['allowed']:
            return DRFResponse(
                {"detail": eval_result['message'], "type": "GOVERNANCE_BLOCK"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # SR-9: Facilitators Cannot Edit Member Content
        if request.user.role in ['FACILITATOR', 'CO_FACILITATOR'] and instance.author != request.user:
            return DRFResponse(
                {"detail": "System Rule SR-9: Facilitators are prohibited from editing member-authored content.", "type": "GOVERNANCE_BLOCK"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

class ResponseViewSet(viewsets.ModelViewSet):
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Determine the action for governance evaluation
        resp_type = request.data.get('type', '').upper()
        action = 'RESPOND'
        
        if 'ENDORSE' in resp_type:
            action = 'ENDORSE'
        elif 'CHALLENGE' in resp_type:
            action = 'CHALLENGE'
        elif 'CLARIFY' in resp_type or 'CLARIFICATION' in resp_type:
            action = 'CLARIFY'

        eval_result = RulesService.evaluate_action(
            user=request.user,
            action=action,
            scope_type='DISCUSSION',
            scope_id=request.data.get('discussion'),
            payload=request.data
        )

        if not eval_result['allowed']:
            return DRFResponse(
                {"detail": eval_result['message'], "type": "GOVERNANCE_BLOCK"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        is_official = self.request.user.role in ['FACILITATOR', 'CO_FACILITATOR', 'SYSTEM']
        serializer.save(author=self.request.user, is_official=is_official)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # SR-9: Facilitators Cannot Edit Member Content
        if request.user.role in ['FACILITATOR', 'CO_FACILITATOR'] and instance.author != request.user:
            return DRFResponse(
                {"detail": "System Rule SR-9: Facilitators are prohibited from editing member-authored content.", "type": "GOVERNANCE_BLOCK"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

class RuleViewSet(viewsets.ModelViewSet):
    queryset = Rule.objects.all()
    serializer_class = RuleSerializer
    permission_classes = [permissions.IsAuthenticated] # Facilitators need access

class RuleDecisionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RuleDecision.objects.all()
    serializer_class = RuleDecisionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = RuleDecision.objects.all().order_by('-timestamp')
        scope_id = self.request.query_params.get('scope_id')
        result = self.request.query_params.get('result')
        limit = self.request.query_params.get('limit')

        if scope_id:
            queryset = queryset.filter(scope_id=scope_id)
        if result:
            queryset = queryset.filter(result=result)
        
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
        
        return queryset

class CommunityMemberViewSet(viewsets.ModelViewSet):
    queryset = CommunityMember.objects.all()
    serializer_class = CommunityMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CommunityMember.objects.all().order_by('-joined_at')
        managed = self.request.query_params.get('managed')
        community_id = self.request.query_params.get('community')

        if managed == 'true':
            # Communities where the user is an ACTIVE FACILITATOR
            managed_communities = Community.objects.filter(
                communitymember__user=self.request.user, 
                communitymember__user__role='FACILITATOR', 
                communitymember__status='ACTIVE'
            )
            queryset = queryset.filter(community__in=managed_communities)
        
        if community_id:
            queryset = queryset.filter(community_id=community_id)
            
        return queryset

# ============================================
# ENHANCED RULES ENGINE VIEWSETS
# ============================================

from .serializers import (
    BoardTypeSerializer, BoardTypeTermSerializer, ReportSerializer,
    ModerationActionSerializer, AppealSerializer
)
from .models import BoardType, BoardTypeTerm, Report, ModerationAction, Appeal

class BoardTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to board types for context-aware moderation"""
    queryset = BoardType.objects.all()
    serializer_class = BoardTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class BoardTypeTermViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to board type terms"""
    queryset = BoardTypeTerm.objects.all()
    serializer_class = BoardTypeTermSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = BoardTypeTerm.objects.all()
        board_type_id = self.request.query_params.get('board_type')
        if board_type_id:
            queryset = queryset.filter(board_type_id=board_type_id)
        return queryset

class ReportViewSet(viewsets.ModelViewSet):
    """
    Allows members to report/flag content.
    Implements the reporting system for threshold-based enforcement.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Facilitators see all reports, members see only their own
        if self.request.user.role in ['FACILITATOR', 'CO_FACILITATOR', 'SYSTEM']:
            return Report.objects.all().order_by('-created_at')
        return Report.objects.filter(reporter=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class ModerationActionViewSet(viewsets.ModelViewSet):
    """
    Formal log of moderation actions.
    Only facilitators can create moderation actions.
    """
    queryset = ModerationAction.objects.all()
    serializer_class = ModerationActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Facilitators see all, members see only their own
        user = self.request.user
        queryset = ModerationAction.objects.all().order_by('-created_at')
        
        if user.role != 'FACILITATOR' and not user.is_staff:
            queryset = queryset.filter(target_user=user)
            
        # Filter by target user if requested (and allowed)
        target_user = self.request.query_params.get('target_user')
        if target_user:
            queryset = queryset.filter(target_user_id=target_user)
            
        return queryset
    
    def perform_create(self, serializer):
        # Only facilitators can create moderation actions
        if self.request.user.role not in ['FACILITATOR', 'CO_FACILITATOR', 'SYSTEM']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only facilitators can create moderation actions.")
        
        action_instance = serializer.save(moderator=self.request.user)
        audit_logger.info(
            f"AUDIT [MODERATION_ACTION]: {action_instance.action} issued by {self.request.user.username} "
            f"against {action_instance.target_user.username}. Reason: {action_instance.reason}"
        )
        # Deduct reputation for being moderated
        from .services import ReputationService
        penalty = -10 if action_instance.action == 'REMOVE' else -5
        ReputationService.adjust_reputation(action_instance.target_user, penalty, reason=f"Moderation action {action_instance.action} issued.")

class AppealViewSet(viewsets.ModelViewSet):
    """
    Allows users to contest moderation actions.
    Implements SR-22: Right to Appeal.
    """
    queryset = Appeal.objects.all()
    serializer_class = AppealSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Facilitators see all appeals, members see only their own
        if self.request.user.role in ['FACILITATOR', 'CO_FACILITATOR', 'SYSTEM']:
            return Appeal.objects.all().order_by('-created_at')
        return Appeal.objects.filter(appellant=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(appellant=self.request.user)
    
    @action(detail=True, methods=['post'])
    def decide(self, request, pk=None):
        """Facilitators can approve or reject appeals"""
        if request.user.role not in ['FACILITATOR', 'CO_FACILITATOR', 'SYSTEM']:
            return DRFResponse({'detail': 'Only facilitators can decide appeals'}, status=status.HTTP_403_FORBIDDEN)
        
        appeal = self.get_object()
        decision = request.data.get('decision')  # 'APPROVED' or 'REJECTED'
        decision_reason = request.data.get('decision_reason', '')
        
        if decision not in ['APPROVED', 'REJECTED']:
            return DRFResponse({'detail': 'Invalid decision'}, status=status.HTTP_400_BAD_REQUEST)
        
        appeal.status = decision
        appeal.decision_reason = decision_reason
        appeal.decided_by = request.user
        appeal.decided_at = datetime.now(timezone.utc)
        appeal.save()
        
        # If approved, reverse the moderation action
        if decision == 'APPROVED':
            audit_logger.info(f"AUDIT [APPEAL_APPROVED]: Appeal {appeal.id} approved by {request.user.username}. Decision reason: {decision_reason}")
            # Restore reputation for wrongful moderation
            from .services import ReputationService
            ReputationService.adjust_reputation(appeal.appellant, 10, reason=f"Appeal {appeal.id} approved - restoring reputation.")
            
            # Logic to reverse the action would go here
            # For now, just mark it as reversed in a notification
            Notification.objects.create(
                user=appeal.appellant,
                title="Appeal Approved",
                message=f"Your appeal has been approved. Reason: {decision_reason}",
                link=f"/appeals/{appeal.id}"
            )
        
        else:
            audit_logger.info(f"AUDIT [APPEAL_REJECTED]: Appeal {appeal.id} rejected by {request.user.username}. Decision reason: {decision_reason}")
            # Deduct reputation for failed appeal? 
            from .services import ReputationService
            ReputationService.adjust_reputation(appeal.appellant, -5, reason=f"Appeal {appeal.id} rejected - frivolous appeal penalty.")
        
        return DRFResponse(AppealSerializer(appeal).data)

class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from .services import GovernanceTriggerService
        user = self.request.user
        content_type = self.request.data.get('content_type')
        object_id = self.request.data.get('object_id')
        vote_type = self.request.data.get('vote_type')

        existing_vote = Vote.objects.filter(user=user, content_type=content_type, object_id=object_id).first()
        
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                existing_vote.delete()
                audit_logger.info(f"AUDIT [VOTE_REMOVED]: {user.username} removed {vote_type} from {content_type} {object_id}")
            else:
                old_type = existing_vote.vote_type
                existing_vote.vote_type = vote_type
                existing_vote.save()
                audit_logger.info(f"AUDIT [VOTE_SWITCH]: {user.username} switched {old_type}->{vote_type} on {content_type} {object_id}")
        else:
            serializer.save(user=user)
            audit_logger.info(f"AUDIT [VOTE_CAST]: {user.username} cast {vote_type} on {content_type} {object_id}")

        # Trigger threshold checks
        GovernanceTriggerService.check_thresholds(content_type, object_id)

