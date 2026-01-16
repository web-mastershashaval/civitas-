from rest_framework import serializers
from .models import User, Community, Board, SubBoard, Discussion, Response, Rule, RuleDecision

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'email']

class CommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = '__all__'

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = '__all__'

class SubBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubBoard
        fields = '__all__'

class DiscussionSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    
    class Meta:
        model = Discussion
        fields = ['id', 'title', 'type', 'content', 'author', 'author_name', 'sub_board', 'created_at', 'sources']

class ResponseSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Response
        fields = ['id', 'content', 'type', 'is_official', 'author', 'author_name', 'discussion', 'created_at']

class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = '__all__'

class RuleDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RuleDecision
        fields = '__all__'
