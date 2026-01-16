from rest_framework import viewsets, permissions, status
from rest_framework.response import Response as DRFResponse
from .models import User, Community, Board, SubBoard, Discussion, Response, Rule, RuleDecision
from .serializers import (
    UserSerializer, CommunitySerializer, BoardSerializer, 
    SubBoardSerializer, DiscussionSerializer, ResponseSerializer, 
    RuleSerializer, RuleDecisionSerializer
)
from .services import RulesService

class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubBoardViewSet(viewsets.ModelViewSet):
    queryset = SubBoard.objects.all()
    serializer_class = SubBoardSerializer
    permission_classes = [permissions.IsAuthenticated]

class DiscussionViewSet(viewsets.ModelViewSet):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        # ... existing logic ...
        eval_result = RulesService.evaluate_action(
            user=request.user,
            action='RESPOND',
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
    permission_classes = [permissions.IsAdminUser] # Only admins/system can define rules

class RuleDecisionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RuleDecision.objects.all()
    serializer_class = RuleDecisionSerializer
    permission_classes = [permissions.IsAuthenticated]
