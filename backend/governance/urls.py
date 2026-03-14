from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CommunityViewSet, BoardViewSet, SubBoardViewSet, 
    DiscussionViewSet, ResponseViewSet, RuleViewSet, RuleDecisionViewSet,
    CommunityMemberViewSet, NotificationViewSet, FollowViewSet,
    BoardTypeViewSet, BoardTypeTermViewSet, ReportViewSet,
    ModerationActionViewSet, AppealViewSet, VoteViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'communities', CommunityViewSet)
router.register(r'boards', BoardViewSet)
router.register(r'sub-boards', SubBoardViewSet)
router.register(r'discussions', DiscussionViewSet)
router.register(r'responses', ResponseViewSet)
router.register(r'rules', RuleViewSet)
router.register(r'audit-logs', RuleDecisionViewSet, basename='audit-logs')
router.register(r'memberships', CommunityMemberViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'follows', FollowViewSet)
router.register(r'votes', VoteViewSet)

# Enhanced Rules Engine Endpoints
router.register(r'board-types', BoardTypeViewSet)
router.register(r'board-type-terms', BoardTypeTermViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'moderation-actions', ModerationActionViewSet)
router.register(r'appeals', AppealViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

