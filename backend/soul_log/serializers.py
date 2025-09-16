# backend/soul_log/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, JournalEntry, InsightTemplate, GeneratedInsight

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'prefer_biblical', 'prefer_islamic', 'prefer_psychological', 'created_at']

class JournalEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    emotions_list = serializers.SerializerMethodField()
    detected_emotions_data = serializers.SerializerMethodField()
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'user', 'title', 'content', 'mood_rating', 'emotions', 
            'created_at', 'updated_at', 'sentiment_score', 'detected_emotions',
            'keywords', 'emotions_list', 'detected_emotions_data'
        ]
        read_only_fields = ['user', 'sentiment_score', 'detected_emotions', 'keywords']
    
    def get_emotions_list(self, obj):
        return obj.get_emotions_list()
    
    def get_detected_emotions_data(self, obj):
        return obj.get_detected_emotions()

class GeneratedInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedInsight
        fields = ['id', 'insight_type', 'title', 'content', 'scripture_reference', 'created_at']

class JournalEntryWithInsightsSerializer(JournalEntrySerializer):
    insights = GeneratedInsightSerializer(many=True, read_only=True)
    
    class Meta(JournalEntrySerializer.Meta):
        fields = JournalEntrySerializer.Meta.fields + ['insights']