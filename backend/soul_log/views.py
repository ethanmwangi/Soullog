# backend/soul_log/views.py

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import models
from textblob import TextBlob
import json
import re
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication

from .models import UserProfile, JournalEntry, InsightTemplate, GeneratedInsight
from .serializers import (
    UserProfileSerializer, 
    JournalEntrySerializer, 
    JournalEntryWithInsightsSerializer,
    GeneratedInsightSerializer,
    UserRegistrationSerializer,
)

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        }, status=status.HTTP_201_CREATED)

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
    
    def analyze_entry_simple(self, journal_entry):
        """Quick analysis without OpenAI"""
        from textblob import TextBlob
        import json
        
        content = journal_entry.content.lower()
        blob = TextBlob(journal_entry.content)
        sentiment_score = blob.sentiment.polarity
        
        journal_entry.sentiment_score = sentiment_score
        journal_entry.keywords = ','.join(content.split()[:5])
        journal_entry.save()
        
        user_profile, created = UserProfile.objects.get_or_create(
            user=journal_entry.user,
            defaults={'prefer_biblical': True, 'prefer_islamic': True, 'prefer_psychological': True}
        )
        
        if sentiment_score < -0.2:
            psych_content = "I notice you might be going through a challenging time. Remember that difficult emotions are temporary and it's okay to seek support."
        elif sentiment_score > 0.2:
            psych_content = "It's wonderful to see positive emotions in your reflection! Take a moment to appreciate what's going well in your life."
        else:
            psych_content = "Your reflection shows emotional balance. This is a good time for self-reflection and planning ahead."
        
        GeneratedInsight.objects.create(
            journal_entry=journal_entry,
            insight_type='psychological',
            title="Personal Reflection",
            content=psych_content
        )
        
        if user_profile.prefer_biblical:
            GeneratedInsight.objects.create(
                journal_entry=journal_entry,
                insight_type='biblical',
                title="God's Peace",
                content="Remember that God is with you in all circumstances. Cast your cares upon Him, for He cares for you.",
                scripture_reference="'Cast all your anxiety on him because he cares for you.' - 1 Peter 5:7"
            )
        
        if user_profile.prefer_islamic:
            GeneratedInsight.objects.create(
                journal_entry=journal_entry,
                insight_type='islamic',
                title="Trust in Allah",
                content="Allah knows what is best for you. Trust in His wisdom and find peace in His guidance.",
                scripture_reference="'And Allah is the best of planners.' - Quran 8:30"
            )
    
    def analyze_and_generate_insights(self, journal_entry):
        """Analyze journal entry and generate AI insights using OpenAI"""
        from .ai_service import AIInsightService
        
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
        
        if analysis:
            journal_entry.sentiment_score = analysis.get('sentiment_score', 0)
            journal_entry.keywords = ','.join(analysis.get('keywords', []))
            journal_entry.detected_emotions = json.dumps(analysis.get('emotions', []))
            journal_entry.save()
            
            if preferences['prefer_psychological'] and analysis.get('psychological_insight'):
                GeneratedInsight.objects.create(
                    journal_entry=journal_entry,
                    insight_type='psychological',
                    title=analysis['psychological_insight']['title'],
                    content=analysis['psychological_insight']['content']
                )
            
            if preferences['prefer_biblical'] and analysis.get('biblical_insight'):
                GeneratedInsight.objects.create(
                    journal_entry=journal_entry,
                    insight_type='biblical',
                    title=analysis['biblical_insight']['title'],
                    content=analysis['biblical_insight']['content'],
                    scripture_reference=analysis['biblical_insight'].get('scripture', '')
                )
            
            if preferences['prefer_islamic'] and analysis.get('islamic_insight'):
                GeneratedInsight.objects.create(
                    journal_entry=journal_entry,
                    insight_type='islamic',
                    title=analysis['islamic_insight']['title'],
                    content=analysis['islamic_insight']['content'],
                    scripture_reference=analysis['islamic_insight'].get('scripture', '')
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
