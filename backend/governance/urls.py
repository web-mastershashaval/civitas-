from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CommunityViewSet, BoardViewSet, SubBoardViewSet, 
    DiscussionViewSet, ResponseViewSet, RuleViewSet, RuleDecisionViewSet
)

router = DefaultRouter()
router.register(r'communities', CommunityViewSet)
router.register(r'boards', BoardViewSet)
router.register(r'sub-boards', SubBoardViewSet)
router.register(r'discussions', DiscussionViewSet)
router.register(r'responses', ResponseViewSet)
router.register(r'rules', RuleViewSet)
router.register(r'audit-logs', RuleDecisionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
