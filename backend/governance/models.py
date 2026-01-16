from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=50, choices=[
        ('CITIZEN', 'Citizen'),
        ('FACILITATOR', 'Facilitator'),
        ('CO_FACILITATOR', 'Co-Facilitator'),
        ('SYSTEM', 'System'),
    ], default='CITIZEN')

    def __str__(self):
        return self.username

class Community(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, through='CommunityMember')

    def __str__(self):
        return self.name

class CommunityMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='ACTIVE') # ACTIVE, TRIAL, SUSPENDED
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'community')

class Board(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    ref = models.CharField(max_length=100, unique=True)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='boards')

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
    scope_type = models.CharField(max_length=50)
    scope_id = models.UUIDField(null=True, blank=True)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    rule = models.ForeignKey(Rule, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
