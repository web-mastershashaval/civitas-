from rest_framework import serializers
from .models import (
    User, Community, CommunityMember, Board, SubBoard, Discussion, Response, 
    Rule, RuleDecision, Follow, Notification, BoardType, BoardTypeTerm, 
    Report, ModerationAction, Appeal, Vote
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'email', 'avatar', 'bio', 'phone', 'facebook_profile', 'reputation_score', 'has_completed_orientation']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate_username(self, value):
        """Check if username already exists"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose a different username.")
        return value

    def validate_email(self, value):
        """Check if email already exists"""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists. Please use a different email or sign in.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'MEMBER')
        )
        return user

class SubBoardSerializer(serializers.ModelSerializer):
    boardName = serializers.ReadOnlyField(source='board.name')
    community_name = serializers.ReadOnlyField(source='board.community.name')
    community_image = serializers.SerializerMethodField()
    community_banner = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = SubBoard
        fields = ['id', 'name', 'topic', 'description', 'sources', 'board', 'boardName', 'community_name', 'community_image', 'community_banner', 'image']
        extra_kwargs = {
            'board': {'write_only': True, 'required': True}
        }

    def get_image(self, obj):
        if obj.board.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.board.image.url)
            return obj.board.image.url
        return None

    def get_community_image(self, obj):
        if obj.board.community and obj.board.community.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.board.community.image.url)
            return obj.board.community.image.url
        return None

    def get_community_banner(self, obj):
        if obj.board.community and obj.board.community.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.board.community.banner.url)
            return obj.board.community.banner.url
        return None

class BoardSerializer(serializers.ModelSerializer):
    subBoards = SubBoardSerializer(many=True, read_only=True, source='sub_boards')
    community_name = serializers.ReadOnlyField(source='community.name')
    community_image = serializers.SerializerMethodField()
    community_banner = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Board
        fields = ['id', 'name', 'ref', 'community', 'community_name', 'community_image', 'community_banner', 'image', 'subBoards']
        extra_kwargs = {
            'community': {'write_only': True, 'required': True}
        }

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_community_image(self, obj):
        if obj.community and obj.community.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.community.image.url)
            return obj.community.image.url
        return None

    def get_community_banner(self, obj):
        if obj.community and obj.community.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.community.banner.url)
            return obj.community.banner.url
        return None

class ResponseSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_username = serializers.ReadOnlyField(source='author.username')
    author_id = serializers.ReadOnlyField(source='author.id')
    author_avatar = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()

    class Meta:
        model = Response
        fields = ['id', 'content', 'type', 'is_official', 'author', 'author_username', 'author_id', 'author_avatar', 'discussion', 'created_at', 'timestamp', 'upvotes', 'downvotes', 'image']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_upvotes(self, obj):
        return Vote.objects.filter(content_type='RESPONSE', object_id=obj.id, vote_type='UP').count()

    def get_downvotes(self, obj):
        return Vote.objects.filter(content_type='RESPONSE', object_id=obj.id, vote_type='DOWN').count()

    def get_timestamp(self, obj):
        # Basic human-readable timestamp for frontend assimilation
        return "recently" # In production, use naturaltime or similar

    def get_author_avatar(self, obj):
        if obj.author and obj.author.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.avatar.url)
            return obj.author.avatar.url
        return None

class DiscussionSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_id = serializers.ReadOnlyField(source='author.id')
    author_avatar = serializers.SerializerMethodField()
    board = serializers.ReadOnlyField(source='sub_board.board.id')
    boardName = serializers.ReadOnlyField(source='sub_board.board.name')
    subBoardName = serializers.ReadOnlyField(source='sub_board.name')
    responses = ResponseSerializer(many=True, read_only=True)
    body = serializers.ReadOnlyField(source='content')
    timestamp = serializers.SerializerMethodField()
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = ['id', 'title', 'type', 'body', 'content', 'author', 'author_id', 'author_avatar', 'sub_board', 'subBoardName', 'board', 'boardName', 'created_at', 'sources', 'responses', 'timestamp', 'image', 'upvotes', 'downvotes']

    def get_upvotes(self, obj):
        return Vote.objects.filter(content_type='DISCUSSION', object_id=obj.id, vote_type='UP').count()

    def get_downvotes(self, obj):
        return Vote.objects.filter(content_type='DISCUSSION', object_id=obj.id, vote_type='DOWN').count()

    def get_timestamp(self, obj):
        return "recently"

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_author_avatar(self, obj):
        if obj.author and obj.author.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.avatar.url)
            return obj.author.avatar.url
        return None

class CommunitySerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    activeDiscussions = serializers.SerializerMethodField()
    pendingFlags = serializers.SerializerMethodField()
    boards = BoardSerializer(many=True, read_only=True)
    facilitators = serializers.SerializerMethodField()
    pending_applications = serializers.SerializerMethodField()

    is_member = serializers.SerializerMethodField()
    membership_status = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'access_type', 'governance_type', 'members', 'activeDiscussions', 'pendingFlags', 'boards', 'facilitators', 'is_member', 'pending_applications', 'membership_status', 'settings', 'image', 'banner']

    def get_membership_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = CommunityMember.objects.filter(user=request.user, community=obj).first()
            return member.status if member else None
        return None

    def get_pending_applications(self, obj):
        # Only share this with facilitators of this community
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return []
            
        is_fac = CommunityMember.objects.filter(user=request.user, community=obj, user__role='FACILITATOR', status='ACTIVE').exists()
        if not is_fac:
            return []
            
        pending = obj.communitymember_set.filter(status='PENDING')
        return [{"username": p.user.username, "id": p.user.id} for p in pending]

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CommunityMember.objects.filter(user=request.user, community=obj, status='ACTIVE').exists()
        return False

    def get_members(self, obj):
        # Only count ACTIVE members (exclude suspended/pending if any)
        return obj.communitymember_set.filter(status='ACTIVE').count()

    def get_activeDiscussions(self, obj):
        # Count all discussions in all boards of this community
        return Discussion.objects.filter(sub_board__board__community=obj).count()

    def get_pendingFlags(self, obj):
        # Count all "BLOCKED" decisions for this community context
        return RuleDecision.objects.filter(scope_type='COMMUNITY', scope_id=obj.id, result='BLOCKED').count()

    def get_facilitators(self, obj):
        # Return list of dicts for facilitators as expected by CommunityProfile.tsx
        return [{"name": f.username, "bio": "Lead Facilitator"} for f in obj.members.filter(role='FACILITATOR')]

class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = '__all__'

class RuleDecisionSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    rule_code = serializers.ReadOnlyField(source='rule.code')
    timestamp_relative = serializers.SerializerMethodField()

    class Meta:
        model = RuleDecision
        fields = ['id', 'user', 'user_name', 'action', 'scope_type', 'scope_id', 'result', 'rule', 'rule_code', 'reason', 'timestamp', 'timestamp_relative']

    def get_timestamp_relative(self, obj):
        # Very basic relative time
        return "Recently"

class CommunityMemberSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.SerializerMethodField()
    community_name = serializers.ReadOnlyField(source='community.name')
    role = serializers.ReadOnlyField(source='user.role')
    posts = serializers.SerializerMethodField()
    joined_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = CommunityMember
        fields = ['id', 'username', 'avatar', 'community_name', 'role', 'status', 'joined_at', 'joined_at_formatted', 'community', 'posts']

    def get_posts(self, obj):
        return Discussion.objects.filter(author=obj.user, sub_board__board__community=obj.community).count()

    def get_joined_at_formatted(self, obj):
        return obj.joined_at.strftime("%b %d, %Y")

    def get_avatar(self, obj):
        if obj.user and obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
            return obj.user.avatar.url
        return None

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'user', 'content_type', 'object_id', 'created_at']
        extra_kwargs = {'user': {'read_only': True}}

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'link', 'is_read', 'created_at']
        extra_kwargs = {'user': {'read_only': True}}

# ============================================
# ENHANCED RULES ENGINE SERIALIZERS
# ============================================

class BoardTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardType
        fields = ['id', 'key', 'name', 'description', 'tone_guidelines', 'requires_citations', 'created_at']

class BoardTypeTermSerializer(serializers.ModelSerializer):
    board_type_name = serializers.ReadOnlyField(source='board_type.name')
    
    class Meta:
        model = BoardTypeTerm
        fields = ['id', 'board_type', 'board_type_name', 'term', 'term_type', 'created_at']

class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.ReadOnlyField(source='reporter.username')
    community_id = serializers.SerializerMethodField()
    community_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reporter_username', 'content_type', 'object_id', 'reason', 'status', 'created_at', 'community_id', 'community_name']
        extra_kwargs = {'reporter': {'read_only': True}}

    def get_community_id(self, obj):
        from .models import Discussion, Response
        if obj.content_type == 'DISCUSSION':
            discussion = Discussion.objects.filter(id=obj.object_id).first()
            if discussion:
                return discussion.sub_board.board.community.id
        elif obj.content_type == 'RESPONSE':
            response = Response.objects.filter(id=obj.object_id).first()
            if response:
                return response.discussion.sub_board.board.community.id
        return None

    def get_community_name(self, obj):
        from .models import Discussion, Response
        if obj.content_type == 'DISCUSSION':
            discussion = Discussion.objects.filter(id=obj.object_id).first()
            if discussion:
                return discussion.sub_board.board.community.name
        elif obj.content_type == 'RESPONSE':
            response = Response.objects.filter(id=obj.object_id).first()
            if response:
                return response.discussion.sub_board.board.community.name
        return None

class ModerationActionSerializer(serializers.ModelSerializer):
    moderator_username = serializers.ReadOnlyField(source='moderator.username')
    target_username = serializers.ReadOnlyField(source='target_user.username')
    rule_code = serializers.ReadOnlyField(source='rule.code')
    # Allow looking up rule by its SR-XX code
    rule = serializers.SlugRelatedField(
        slug_field='code',
        queryset=Rule.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = ModerationAction
        fields = [
            'id', 'content_type', 'object_id', 'action', 'rule', 'rule_code',
            'moderator', 'moderator_username', 'target_user', 'target_username',
            'reason', 'duration', 'created_at'
        ]
        extra_kwargs = {'moderator': {'read_only': True}}

class AppealSerializer(serializers.ModelSerializer):
    appellant_username = serializers.ReadOnlyField(source='appellant.username')
    decided_by_username = serializers.ReadOnlyField(source='decided_by.username')
    moderation_action_details = ModerationActionSerializer(source='moderation_action', read_only=True)
    
    class Meta:
        model = Appeal
        fields = [
            'id', 'moderation_action', 'moderation_action_details', 'appellant', 
            'appellant_username', 'appeal_reason', 'status', 'decision_reason',
            'decided_by', 'decided_by_username', 'created_at', 'decided_at'
        ]
        extra_kwargs = {'appellant': {'read_only': True}}

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'user', 'content_type', 'object_id', 'vote_type', 'created_at']
        extra_kwargs = {'user': {'read_only': True}}
