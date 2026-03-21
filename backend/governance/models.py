from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid

class UserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        """
        Create and save a regular user with the given username, email, and password.
        """
        if not username:
            raise ValueError('The Username field must be set')
        
        email = self.normalize_email(email) if email else None
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """
        Create and save a superuser with the given username, email, and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'SYSTEM')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    objects = UserManager()
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=50, choices=[
        ('MEMBER', 'Member'),
        ('FACILITATOR', 'Facilitator'),
        ('CO_FACILITATOR', 'Co-Facilitator'),
        ('SYSTEM', 'System'),
    ], default='MEMBER')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    facebook_profile = models.CharField(max_length=255, blank=True, null=True)
    # Mute functionality for rule enforcement
    is_muted = models.BooleanField(default=False)
    mute_until = models.DateTimeField(null=True, blank=True)
    
    # Reputation system
    reputation_score = models.IntegerField(default=100)

    # Orientation status
    has_completed_orientation = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class Community(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    access_type = models.CharField(max_length=50, default='OPEN') # OPEN, APPLICATION, INVITE
    governance_type = models.CharField(max_length=50, default='MEDIUM') # LOW, MEDIUM, HIGH
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='communities/', blank=True, null=True)
    banner = models.ImageField(upload_to='banners/', blank=True, null=True)
    settings = models.JSONField(default=dict, blank=True)
    members = models.ManyToManyField(User, through='CommunityMember')

    def __str__(self):
        return self.name

class CommunityMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='PENDING') # ACTIVE, PENDING, SUSPENDED, REJECTED
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'community')

class Board(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    ref = models.CharField(max_length=100, unique=True)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='boards')
    board_type = models.ForeignKey('BoardType', on_delete=models.SET_NULL, null=True, blank=True, related_name='boards')
    image = models.ImageField(upload_to='board_images/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.ref})"

class SubBoard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    description = models.TextField()
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='sub_boards')
    sources = models.JSONField(default=list) # List of URL strings

    def __str__(self):
        return self.name

class Discussion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50) # Proposal, Question, Evidence, Directive
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    sub_board = models.ForeignKey(SubBoard, on_delete=models.CASCADE, related_name='discussions')
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='discussion_images/', blank=True, null=True)
    sources = models.JSONField(default=list)

    def __str__(self):
        return self.title

class Response(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.TextField()
    type = models.CharField(max_length=50) # Clarification, Challenge, Supporting Evidence, Facilitator Intervention
    is_official = models.BooleanField(default=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='responses')
    image = models.ImageField(upload_to='response_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Rule(models.Model):
    SCOPE_CHOICES = [
        ('PLATFORM', 'Platform'),
        ('COMMUNITY', 'Community'),
        ('BOARD', 'Board'),
        ('SUB_BOARD', 'Sub-Board'),
        ('DISCUSSION', 'Discussion'),
    ]
    ACTION_CHOICES = [
        ('CREATE_DISCUSSION', 'Create Discussion'),
        ('RESPOND', 'Respond'),
        ('ENDORSE', 'Endorse'),
        ('CHALLENGE', 'Challenge'),
        ('CLARIFY', 'Clarify'),
        ('EDIT', 'Edit'),
        ('FLAG', 'Flag'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, null=True, blank=True) # e.g. SR-15
    is_system = models.BooleanField(default=False) # Constitutional rules
    description = models.TextField(blank=True, null=True)
    scope_type = models.CharField(max_length=50, choices=SCOPE_CHOICES)
    scope_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    role = models.CharField(max_length=50)
    conditions = models.JSONField() # { max_per_day, cooldown_minutes, etc }
    enforcement = models.JSONField() # { type, message }
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class RuleDecision(models.Model):
    RESULT_CHOICES = [
        ('ALLOWED', 'Allowed'),
        ('BLOCKED', 'Blocked'),
        ('QUEUED', 'Queued'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=RESULT_CHOICES, default='ALLOWED') # Compatibility with some older calls might use 'status' vs 'result'
    scope_type = models.CharField(max_length=50) # PLATFORM, COMMUNITY, BOARD, SUB_BOARD, DISCUSSION
    scope_id = models.UUIDField(null=True, blank=True)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    rule = models.ForeignKey(Rule, on_delete=models.SET_NULL, null=True)
    reason = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class Follow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    content_type = models.CharField(max_length=50) # 'BOARD' or 'SUB_BOARD'
    object_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

# ============================================
# ENHANCED RULES ENGINE MODELS
# ============================================

class BoardType(models.Model):
    """
    Defines contextual categories for boards (e.g., TECHNICAL, CIVIC_DIALOGUE, RESEARCH).
    Enables context-aware content moderation.
    """
    TECHNICAL = 'TECHNICAL'
    CIVIC_DIALOGUE = 'CIVIC_DIALOGUE'
    RESEARCH = 'RESEARCH'
    GENERAL = 'GENERAL'
    
    TYPE_CHOICES = [
        (TECHNICAL, 'Technical'),
        (CIVIC_DIALOGUE, 'Civic Dialogue'),
        (RESEARCH, 'Research'),
        (GENERAL, 'General'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=50, unique=True, choices=TYPE_CHOICES)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    tone_guidelines = models.TextField(blank=True, null=True)
    requires_citations = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class BoardTypeTerm(models.Model):
    """
    Dictionary of terms per BoardType to enable context-aware moderation.
    Example: "kill" is ALLOWED in TECHNICAL boards but DISALLOWED in GENERAL.
    """
    ALLOWED = 'ALLOWED'
    CONTEXTUAL = 'CONTEXTUAL'
    DISALLOWED = 'DISALLOWED'
    
    TERM_TYPE_CHOICES = [
        (ALLOWED, 'Allowed'),
        (CONTEXTUAL, 'Contextual - Requires Review'),
        (DISALLOWED, 'Disallowed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    board_type = models.ForeignKey(BoardType, on_delete=models.CASCADE, related_name='terms')
    term = models.CharField(max_length=255)
    term_type = models.CharField(max_length=50, choices=TERM_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('board_type', 'term')
    
    def __str__(self):
        return f"{self.term} ({self.term_type}) - {self.board_type.name}"

class Report(models.Model):
    """
    Tracks member reports/flags on discussions and responses.
    Enables report-threshold based rule enforcement.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    content_type = models.CharField(max_length=50)  # 'DISCUSSION' or 'RESPONSE'
    object_id = models.UUIDField()  # ID of the Discussion or Response
    reason = models.TextField()
    status = models.CharField(max_length=50, default='PENDING')  # PENDING, REVIEWED, DISMISSED
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('reporter', 'content_type', 'object_id')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report by {self.reporter.username} on {self.content_type} {self.object_id}"

class ModerationAction(models.Model):
    """
    Formal log of moderation actions (removal, warning, restriction).
    Implements SR-8: No Silent Moderation - every action must reference a rule.
    """
    REMOVE = 'REMOVE'
    WARN = 'WARN'
    RESTRICT = 'RESTRICT'
    MUTE = 'MUTE'
    
    ACTION_CHOICES = [
        (REMOVE, 'Remove Content'),
        (WARN, 'Warn User'),
        (RESTRICT, 'Restrict Access'),
        (MUTE, 'Mute User'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content_type = models.CharField(max_length=50, blank=True, null=True)  # 'DISCUSSION' or 'RESPONSE'
    object_id = models.UUIDField(blank=True, null=True)  # ID of the affected content
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    rule = models.ForeignKey(Rule, on_delete=models.SET_NULL, null=True, blank=True)
    moderator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='moderation_actions')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_received')
    reason = models.TextField()
    duration = models.CharField(max_length=50, blank=True, null=True)  # For MUTE actions
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.action} by {self.moderator} on {self.target_user.username}"

class Appeal(models.Model):
    """
    System for users to contest moderation actions.
    Implements SR-22: Right to Appeal.
    """
    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending Review'),
        (APPROVED, 'Approved - Action Reversed'),
        (REJECTED, 'Rejected - Action Upheld'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    moderation_action = models.ForeignKey(ModerationAction, on_delete=models.CASCADE, related_name='appeals')
    appellant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appeals_made')
    appeal_reason = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=PENDING)
    decision_reason = models.TextField(blank=True, null=True)
    decided_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='appeals_decided')
    created_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Appeal by {self.appellant.username} - {self.status}"


class Vote(models.Model):
    """
    Direct voting system for discussions and responses.
    Enables threshold-based governance triggers.
    """
    UPVOTE = 'UP'
    DOWNVOTE = 'DOWN'
    
    TYPE_CHOICES = [
        (UPVOTE, 'Upvote'),
        (DOWNVOTE, 'Downvote'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes_cast')
    content_type = models.CharField(max_length=50) # 'DISCUSSION' or 'RESPONSE'
    object_id = models.UUIDField()
    vote_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'content_type', 'object_id')
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"{self.vote_type} by {self.user.username} on {self.content_type} {self.object_id}"
