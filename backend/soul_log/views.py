# backend/soul_log/views.py

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import models
import json
import re
from rest_framework.authentication import TokenAuthentication

from .models import UserProfile, JournalEntry, InsightTemplate, GeneratedInsight
from .serializers import (
    UserProfileSerializer, 
    JournalEntrySerializer, 
    JournalEntryWithInsightsSerializer,
    GeneratedInsightSerializer,
)
from .ai_service import AIInsightService  # Hugging Face AI service import


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class JournalEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = JournalEntryWithInsightsSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        journal_entry = serializer.save(user=self.request.user)
        self.analyze_and_generate_insights(journal_entry)
    
    def analyze_and_generate_insights(self, journal_entry):
        """Analyze journal entry and generate AI insights using Hugging Face"""
        user_profile, created = UserProfile.objects.get_or_create(
            user=journal_entry.user,
            defaults={
                'prefer_biblical': True,
                'prefer_islamic': True,
                'prefer_psychological': True
            }
        )
        
        preferences = {
            'prefer_psychological': user_profile.prefer_psychological,
            'prefer_biblical': user_profile.prefer_biblical,
            'prefer_islamic': user_profile.prefer_islamic,
        }
        
        ai_service = AIInsightService()
        analysis = ai_service.analyze_journal_entry(journal_entry.content, preferences)
        
        if analysis and "error" in analysis:
            print(f"Could not generate AI insights for entry {journal_entry.id}: {analysis['error']}")
            return
        
        if analysis:
            journal_entry.sentiment_score = analysis.get('sentiment_score', 0)
            journal_entry.keywords = ','.join(analysis.get('keywords', []))
            journal_entry.detected_emotions = json.dumps(analysis.get('emotions', []))
            journal_entry.save()
            
            for insight_data in analysis.get('insights', []):
                GeneratedInsight.objects.create(
                    journal_entry=journal_entry,
                    insight_type=insight_data.get('type', 'psychological'),
                    title=insight_data.get('title', 'Generated Insight'),
                    content=insight_data.get('content', ''),
                    scripture_reference=insight_data.get('scripture_reference', '')
                )

class JournalEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JournalEntryWithInsightsSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([TokenAuthentication])
def dashboard_stats(request):
    """Get dashboard statistics for the user"""
    entries = JournalEntry.objects.filter(user=request.user)
    
    total_entries = entries.count()
    avg_mood = entries.exclude(mood_rating__isnull=True).aggregate(
        avg_mood=models.Avg('mood_rating')
    )['avg_mood'] or 0
    
    recent_entries = entries.order_by('-created_at')[:7]
    sentiment_trend = [
        {
            'date': entry.created_at.strftime('%Y-%m-%d'),
            'mood': entry.mood_rating,
            'sentiment': entry.sentiment_score
        } for entry in recent_entries
    ]
    
    return Response({
        'total_entries': total_entries,
        'average_mood': round(avg_mood, 1),
        'sentiment_trend': sentiment_trend,
    })