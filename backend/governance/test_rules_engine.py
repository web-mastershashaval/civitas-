"""
Comprehensive test suite for the Enhanced Rules Engine.
Tests models, services, and API endpoints.
"""
import pytest
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from governance.models import (
    User, Community, Board, SubBoard, Discussion, Response,
    BoardType, BoardTypeTerm, Report, ModerationAction, Appeal,
    Rule, RuleDecision
)
from governance.services import RulesService


@pytest.mark.django_db
class TestBoardTypeModel:
    """Test BoardType and BoardTypeTerm models"""
    
    def test_create_board_type(self):
        """Test creating a board type"""
        board_type = BoardType.objects.create(
            key=BoardType.TECHNICAL,
            name="Technical Discussions",
            description="For technical topics",
            requires_citations=False
        )
        assert board_type.key == BoardType.TECHNICAL
        assert board_type.name == "Technical Discussions"
        assert str(board_type) == "Technical Discussions"
    
    def test_create_board_type_term(self):
        """Test creating contextual terms"""
        board_type = BoardType.objects.create(
            key=BoardType.TECHNICAL,
            name="Technical"
        )
        
        term = BoardTypeTerm.objects.create(
            board_type=board_type,
            term="kill",
            term_type=BoardTypeTerm.ALLOWED
        )
        
        assert term.term == "kill"
        assert term.term_type == BoardTypeTerm.ALLOWED
        assert "kill" in str(term)
        assert "Technical" in str(term)
    
    def test_board_type_term_unique_constraint(self):
        """Test that the same term cannot be added twice to a board type"""
        board_type = BoardType.objects.create(
            key=BoardType.TECHNICAL,
            name="Technical"
        )
        
        BoardTypeTerm.objects.create(
            board_type=board_type,
            term="kill",
            term_type=BoardTypeTerm.ALLOWED
        )
        
        # Attempting to create duplicate should raise error
        with pytest.raises(Exception):
            BoardTypeTerm.objects.create(
                board_type=board_type,
                term="kill",
                term_type=BoardTypeTerm.DISALLOWED
            )


@pytest.mark.django_db
class TestReportModel:
    """Test Report model"""
    
    def test_create_report(self):
        """Test creating a report"""
        user = User.objects.create_user(username="reporter", email="reporter@test.com", password="pass123")
        
        report = Report.objects.create(
            reporter=user,
            content_type="DISCUSSION",
            object_id="12345678-1234-1234-1234-123456789012",
            reason="Spam content",
            status="PENDING"
        )
        
        assert report.reporter == user
        assert report.content_type == "DISCUSSION"
        assert report.status == "PENDING"
        assert "reporter" in str(report)
    
    def test_report_unique_constraint(self):
        """Test that a user cannot report the same content twice"""
        user = User.objects.create_user(username="reporter", email="reporter@test.com", password="pass123")
        object_id = "12345678-1234-1234-1234-123456789012"
        
        Report.objects.create(
            reporter=user,
            content_type="DISCUSSION",
            object_id=object_id,
            reason="First report"
        )
        
        # Second report from same user should fail
        with pytest.raises(Exception):
            Report.objects.create(
                reporter=user,
                content_type="DISCUSSION",
                object_id=object_id,
                reason="Second report"
            )


@pytest.mark.django_db
class TestModerationActionModel:
    """Test ModerationAction model"""
    
    def test_create_moderation_action(self):
        """Test creating a moderation action"""
        moderator = User.objects.create_user(username="mod", email="mod@test.com", password="pass123", role="FACILITATOR")
        target = User.objects.create_user(username="target", email="target@test.com", password="pass123")
        
        action = ModerationAction.objects.create(
            action=ModerationAction.WARN,
            moderator=moderator,
            target_user=target,
            reason="Violation of community guidelines"
        )
        
        assert action.action == ModerationAction.WARN
        assert action.moderator == moderator
        assert action.target_user == target
        assert "mod" in str(action)
        assert "target" in str(action)
    
    def test_mute_action_with_duration(self):
        """Test creating a mute action with duration"""
        moderator = User.objects.create_user(username="mod", email="mod@test.com", password="pass123", role="FACILITATOR")
        target = User.objects.create_user(username="target", email="target@test.com", password="pass123")
        
        action = ModerationAction.objects.create(
            action=ModerationAction.MUTE,
            moderator=moderator,
            target_user=target,
            reason="Repeated spam",
            duration="48 hours"
        )
        
        assert action.action == ModerationAction.MUTE
        assert action.duration == "48 hours"


@pytest.mark.django_db
class TestAppealModel:
    """Test Appeal model"""
    
    def test_create_appeal(self):
        """Test creating an appeal"""
        moderator = User.objects.create_user(username="mod", email="mod@test.com", password="pass123", role="FACILITATOR")
        appellant = User.objects.create_user(username="appellant", email="appellant@test.com", password="pass123")
        
        mod_action = ModerationAction.objects.create(
            action=ModerationAction.REMOVE,
            moderator=moderator,
            target_user=appellant,
            reason="Off-topic"
        )
        
        appeal = Appeal.objects.create(
            moderation_action=mod_action,
            appellant=appellant,
            appeal_reason="This was not off-topic",
            status=Appeal.PENDING
        )
        
        assert appeal.status == Appeal.PENDING
        assert appeal.appellant == appellant
        assert "appellant" in str(appeal)
        assert "PENDING" in str(appeal)


@pytest.mark.django_db
class TestUserMuteFields:
    """Test User model mute functionality"""
    
    def test_user_mute_fields(self):
        """Test that User has mute fields"""
        user = User.objects.create_user(username="testuser", email="test@test.com", password="pass123")
        
        assert hasattr(user, 'is_muted')
        assert hasattr(user, 'mute_until')
        assert user.is_muted is False
        assert user.mute_until is None
    
    def test_set_user_mute(self):
        """Test setting a user as muted"""
        user = User.objects.create_user(username="testuser", email="test@test.com", password="pass123")
        
        mute_until = timezone.now() + timedelta(hours=24)
        user.is_muted = True
        user.mute_until = mute_until
        user.save()
        
        user.refresh_from_db()
        assert user.is_muted is True
        assert user.mute_until == mute_until


@pytest.mark.django_db
class TestRulesServiceMuteChecking:
    """Test RulesService mute status checking"""
    
    def test_muted_user_blocked(self):
        """Test that muted users are blocked from actions"""
        user = User.objects.create_user(username="muted_user", email="muted@test.com", password="pass123")
        user.is_muted = True
        user.mute_until = timezone.now() + timedelta(hours=1)
        user.save()
        
        result = RulesService.evaluate_action(
            user=user,
            action='CREATE_DISCUSSION',
            scope_type='PLATFORM',
            scope_id=None
        )
        
        assert result['allowed'] is False
        assert result['result'] == 'BLOCKED'
        assert 'muted' in result['message'].lower()
    
    def test_expired_mute_auto_clears(self):
        """Test that expired mutes are automatically cleared"""
        user = User.objects.create_user(username="expired_mute", email="expired@test.com", password="pass123")
        user.is_muted = True
        user.mute_until = timezone.now() - timedelta(hours=1)  # Expired
        user.save()
        
        result = RulesService.evaluate_action(
            user=user,
            action='CREATE_DISCUSSION',
            scope_type='PLATFORM',
            scope_id=None
        )
        
        user.refresh_from_db()
        assert user.is_muted is False
        assert user.mute_until is None
        assert result['allowed'] is True


@pytest.mark.django_db
class TestRulesServiceReportThreshold:
    """Test RulesService report threshold logic"""
    
    def test_report_threshold_enforcement(self):
        """Test that actions are blocked when report threshold is exceeded"""
        # Create users
        user = User.objects.create_user(username="author", email="author@test.com", password="pass123")
        reporter1 = User.objects.create_user(username="reporter1", email="reporter1@test.com", password="pass123")
        reporter2 = User.objects.create_user(username="reporter2", email="reporter2@test.com", password="pass123")
        reporter3 = User.objects.create_user(username="reporter3", email="reporter3@test.com", password="pass123")
        
        # Create community and board structure
        community = Community.objects.create(name="Test Community")
        board = Board.objects.create(name="Test Board", ref="test-board", community=community)
        sub_board = SubBoard.objects.create(
            name="Test Sub-Board",
            topic="Testing",
            description="Test",
            board=board
        )
        
        # Create a discussion
        discussion = Discussion.objects.create(
            title="Test Discussion",
            type="Question",
            content="Test content",
            author=user,
            sub_board=sub_board
        )
        
        # Create reports
        for reporter in [reporter1, reporter2, reporter3]:
            Report.objects.create(
                reporter=reporter,
                content_type="DISCUSSION",
                object_id=str(discussion.id),
                reason="Spam",
                status="PENDING"
            )
        
        # Create a rule with max_reports condition
        rule = Rule.objects.create(
            code="TEST-REPORT-THRESHOLD",
            scope_type="SUB_BOARD",
            scope_id=str(sub_board.id),
            action="CREATE_DISCUSSION",
            role="MEMBER",
            conditions={"max_reports": 3},
            enforcement={"type": "BLOCK", "message": "Report threshold exceeded"},
            active=True
        )
        
        # Test that action is blocked
        result = RulesService.evaluate_action(
            user=user,
            action='CREATE_DISCUSSION',
            scope_type='SUB_BOARD',
            scope_id=str(sub_board.id),
            payload={
                'content_type': 'DISCUSSION',
                'object_id': str(discussion.id)
            }
        )
        
        assert result['allowed'] is False
        assert result['result'] == 'BLOCKED'


@pytest.mark.django_db
class TestRulesServiceMemberMaturity:
    """Test RulesService member maturity checks"""
    
    def test_new_member_detection(self):
        """Test that new members (<30 days) are correctly identified"""
        # Create a new user (just created, so < 30 days old)
        new_user = User.objects.create_user(username="newbie", email="newbie@test.com", password="pass123")
        
        # Create a rule that only applies to new members
        rule = Rule.objects.create(
            code="TEST-NEW-MEMBER",
            scope_type="PLATFORM",
            scope_id=None,
            action="CREATE_DISCUSSION",
            role="MEMBER",
            conditions={"member_age": "new", "max_per_day": 1},
            enforcement={"type": "BLOCK", "message": "New member limit"},
            active=True
        )
        
        # The rule should apply (user is new)
        result = RulesService.evaluate_action(
            user=new_user,
            action='CREATE_DISCUSSION',
            scope_type='PLATFORM',
            scope_id=None
        )
        
        # First action should be allowed
        assert result['allowed'] is True


@pytest.mark.django_db
class TestReportViewSetAPI:
    """Test ReportViewSet API endpoints"""
    
    def test_create_report_api(self):
        """Test creating a report via API"""
        client = APIClient()
        user = User.objects.create_user(username="reporter", email="reporter@test.com", password="pass123")
        client.force_authenticate(user=user)
        
        data = {
            'content_type': 'DISCUSSION',
            'object_id': '12345678-1234-1234-1234-123456789012',
            'reason': 'This is spam'
        }
        
        response = client.post('/api/reports/', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Report.objects.count() == 1
        assert Report.objects.first().reporter == user
    
    def test_member_sees_only_own_reports(self):
        """Test that members can only see their own reports"""
        client = APIClient()
        user1 = User.objects.create_user(username="user1", email="user1@test.com", password="pass123")
        user2 = User.objects.create_user(username="user2", email="user2@test.com", password="pass123")
        
        # Create reports from both users
        Report.objects.create(
            reporter=user1,
            content_type="DISCUSSION",
            object_id="12345678-1234-1234-1234-123456789012",
            reason="Report 1"
        )
        Report.objects.create(
            reporter=user2,
            content_type="DISCUSSION",
            object_id="12345678-1234-1234-1234-123456789013",
            reason="Report 2"
        )
        
        # User1 should only see their own report
        client.force_authenticate(user=user1)
        response = client.get('/api/reports/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['reporter_username'] == 'user1'


@pytest.mark.django_db
class TestModerationActionViewSetAPI:
    """Test ModerationActionViewSet API endpoints"""
    
    def test_facilitator_can_create_moderation_action(self):
        """Test that facilitators can create moderation actions"""
        client = APIClient()
        facilitator = User.objects.create_user(
            username="facilitator",
            email="facilitator@test.com",
            password="pass123",
            role="FACILITATOR"
        )
        target = User.objects.create_user(username="target", email="target@test.com", password="pass123")
        
        client.force_authenticate(user=facilitator)
        
        data = {
            'action': 'WARN',
            'target_user': str(target.id),
            'reason': 'Violation of guidelines'
        }
        
        response = client.post('/api/moderation-actions/', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert ModerationAction.objects.count() == 1
        assert ModerationAction.objects.first().moderator == facilitator
    
    def test_member_cannot_create_moderation_action(self):
        """Test that regular members cannot create moderation actions"""
        client = APIClient()
        member = User.objects.create_user(username="member", email="member@test.com", password="pass123", role="MEMBER")
        target = User.objects.create_user(username="target", email="target@test.com", password="pass123")
        
        client.force_authenticate(user=member)
        
        data = {
            'action': 'WARN',
            'target_user': str(target.id),
            'reason': 'Test'
        }
        
        response = client.post('/api/moderation-actions/', data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAppealViewSetAPI:
    """Test AppealViewSet API endpoints"""
    
    def test_create_appeal(self):
        """Test creating an appeal via API"""
        client = APIClient()
        moderator = User.objects.create_user(username="mod", email="mod@test.com", password="pass123", role="FACILITATOR")
        appellant = User.objects.create_user(username="appellant", email="appellant@test.com", password="pass123")
        
        # Create a moderation action
        mod_action = ModerationAction.objects.create(
            action=ModerationAction.REMOVE,
            moderator=moderator,
            target_user=appellant,
            reason="Off-topic"
        )
        
        client.force_authenticate(user=appellant)
        
        data = {
            'moderation_action': str(mod_action.id),
            'appeal_reason': 'This was not off-topic'
        }
        
        response = client.post('/api/appeals/', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Appeal.objects.count() == 1
        assert Appeal.objects.first().appellant == appellant
    
    def test_facilitator_can_decide_appeal(self):
        """Test that facilitators can approve/reject appeals"""
        client = APIClient()
        moderator = User.objects.create_user(username="mod", email="mod@test.com", password="pass123", role="FACILITATOR")
        appellant = User.objects.create_user(username="appellant", email="appellant@test.com", password="pass123")
        
        mod_action = ModerationAction.objects.create(
            action=ModerationAction.REMOVE,
            moderator=moderator,
            target_user=appellant,
            reason="Off-topic"
        )
        
        appeal = Appeal.objects.create(
            moderation_action=mod_action,
            appellant=appellant,
            appeal_reason="Not off-topic",
            status=Appeal.PENDING
        )
        
        client.force_authenticate(user=moderator)
        
        data = {
            'decision': 'APPROVED',
            'decision_reason': 'Upon review, the content was on-topic'
        }
        
        response = client.post(f'/api/appeals/{appeal.id}/decide/', data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        appeal.refresh_from_db()
        assert appeal.status == 'APPROVED'
        assert appeal.decided_by == moderator
        assert appeal.decided_at is not None
