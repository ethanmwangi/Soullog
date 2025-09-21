# backend/soul_log/views.py

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import models
from textblob import TextBlob
import json
import re

from .models import UserProfile, JournalEntry, InsightTemplate, GeneratedInsight
from .serializers import (
    UserProfileSerializer, 
    JournalEntrySerializer, 
    JournalEntryWithInsightsSerializer,
    GeneratedInsightSerializer
)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]  # Allow testing without auth
    
    def get_object(self):
        if self.request.user.is_authenticated:
            profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        else:
            # For testing - use test user
            from django.contrib.auth.models import User
            user, created = User.objects.get_or_create(username='testuser', defaults={'email': 'test@example.com'})
            profile, created = UserProfile.objects.get_or_create(user=user)
        return profile

class JournalEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = JournalEntryWithInsightsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        journal_entry = serializer.save(user=self.request.user)
        # Simple analysis for now (skip OpenAI to save time)
        self.analyze_entry_simple(journal_entry)
    
    def analyze_entry_simple(self, journal_entry):
        """Quick analysis without OpenAI"""
        from textblob import TextBlob
        import json
        
        content = journal_entry.content.lower()
        blob = TextBlob(journal_entry.content)
        sentiment_score = blob.sentiment.polarity
        
        # Update journal entry
        journal_entry.sentiment_score = sentiment_score
        journal_entry.keywords = ','.join(content.split()[:5])
        journal_entry.save()
        
        # Get user preferences
        user_profile, created = UserProfile.objects.get_or_create(
            user=journal_entry.user,
            defaults={'prefer_biblical': True, 'prefer_islamic': True, 'prefer_psychological': True}
        )
        
        # Quick psychological insight
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
        
        # Quick biblical insight
        if user_profile.prefer_biblical:
            GeneratedInsight.objects.create(
                journal_entry=journal_entry,
                insight_type='biblical',
                title="God's Peace",
                content="Remember that God is with you in all circumstances. Cast your cares upon Him, for He cares for you.",
                scripture_reference="'Cast all your anxiety on him because he cares for you.' - 1 Peter 5:7"
            )
        
        # Quick Islamic insight  
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
        
        # Get user preferences
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
        
        # Use AI service to analyze
        ai_service = AIInsightService()
        analysis = ai_service.analyze_journal_entry(journal_entry.content, preferences)
        
        if analysis:
            # Update journal entry with AI analysis
            journal_entry.sentiment_score = analysis.get('sentiment_score', 0)
            journal_entry.keywords = ','.join(analysis.get('keywords', []))
            journal_entry.detected_emotions = json.dumps(analysis.get('emotions', []))
            journal_entry.save()
            
            # Generate insights based on AI analysis
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
    
    def generate_psychological_insight(self, journal_entry, content, sentiment_score):
        """Generate psychological insight"""
        # Simple rule-based system for MVP
        if sentiment_score < -0.3:
            if any(word in content.lower() for word in ['stress', 'overwhelm', 'pressure']):
                title = "Managing Stress and Overwhelm"
                insight = "It sounds like you're experiencing stress from multiple sources. Consider prioritizing tasks and setting boundaries. Try the 5-4-3-2-1 grounding technique when feeling overwhelmed: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."
            elif any(word in content.lower() for word in ['sad', 'down', 'depressed']):
                title = "Coping with Difficult Emotions"
                insight = "It's natural to feel sad sometimes. Consider reaching out to someone you trust, engaging in gentle physical activity, or practicing self-compassion. Remember that emotions are temporary visitors."
            else:
                title = "Processing Negative Emotions"
                insight = "I notice you might be going through a challenging time. It's important to acknowledge your feelings without judgment. Consider journaling more about what specifically is troubling you, or speaking with a trusted friend or counselor."
        elif sentiment_score > 0.3:
            title = "Celebrating Positive Moments"
            insight = "It's wonderful that you're experiencing positive emotions! Consider taking a moment to savor this feeling and think about what contributed to it. Gratitude practices can help extend these positive feelings."
        else:
            title = "Balanced Reflection"
            insight = "Your reflection shows a balanced emotional state. This is a great time for self-reflection and planning. Consider what goals or relationships you'd like to nurture moving forward."
        
        GeneratedInsight.objects.create(
            journal_entry=journal_entry,
            insight_type='psychological',
            title=title,
            content=insight
        )
    
    def generate_religious_insights(self, journal_entry, content, sentiment_score):
        """Generate religious insights based on keywords and sentiment"""
        # Get or create user profile
        user_profile, created = UserProfile.objects.get_or_create(
            user=journal_entry.user,
            defaults={
                'prefer_biblical': True,
                'prefer_islamic': True,
                'prefer_psychological': True
            }
        )
        
        # Biblical insight
        if user_profile.prefer_biblical:
            biblical_insight = self.get_biblical_insight(content, sentiment_score)
            if biblical_insight:
                GeneratedInsight.objects.create(
                    journal_entry=journal_entry,
                    insight_type='biblical',
                    **biblical_insight
                )
        
        # Islamic insight
        if user_profile.prefer_islamic:
            islamic_insight = self.get_islamic_insight(content, sentiment_score)
            if islamic_insight:
                GeneratedInsight.objects.create(
                    journal_entry=journal_entry,
                    insight_type='islamic',
                    **islamic_insight
                )
    
    def get_biblical_insight(self, content, sentiment_score):
        """Get biblical insight based on content analysis"""
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['stress', 'worry', 'anxious', 'overwhelm']):
            return {
                'title': 'Finding Peace in God',
                'content': 'Consider surrendering your worries to God through prayer. Remember that you don\'t have to carry every burden alone. Jesus invites you to find rest in Him during overwhelming times.',
                'scripture_reference': '"Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28'
            }
        elif any(word in content_lower for word in ['sad', 'grief', 'loss', 'hurt']):
            return {
                'title': 'God\'s Comfort in Sorrow',
                'content': 'God is close to the brokenhearted. Allow yourself to grieve while trusting in His love and comfort. He promises to be with you in your darkest moments.',
                'scripture_reference': '"The Lord is close to the brokenhearted and saves those who are crushed in spirit." - Psalm 34:18'
            }
        elif any(word in content_lower for word in ['grateful', 'thankful', 'blessed', 'joy']):
            return {
                'title': 'Gratitude and Praise',
                'content': 'Your heart of gratitude reflects God\'s goodness in your life. Continue to give thanks in all circumstances, recognizing His faithful provision.',
                'scripture_reference': '"Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus." - 1 Thessalonians 5:18'
            }
        else:
            return {
                'title': 'Walking with God',
                'content': 'Continue to seek God in your daily life. He desires a relationship with you and wants to guide your steps.',
                'scripture_reference': '"Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5'
            }
    
    def get_islamic_insight(self, content, sentiment_score):
        """Get Islamic insight based on content analysis"""
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['stress', 'worry', 'anxious', 'overwhelm']):
            return {
                'title': 'Trust in Allah\'s Plan',
                'content': 'Allah tests us with challenges to strengthen our faith. Make dua and trust in Allah\'s plan while taking practical steps forward. Remember, after hardship comes ease.',
                'scripture_reference': '"And whoever fears Allah - He will make for him a way out." - Quran 65:2'
            }
        elif any(word in content_lower for word in ['sad', 'grief', 'loss', 'hurt']):
            return {
                'title': 'Patience and Perseverance',
                'content': 'In times of difficulty, turn to Allah through prayer and remembrance. He is the Most Compassionate and will reward your patience.',
                'scripture_reference': '"And give good tidings to the patient, Who, when disaster strikes them, say, \'Indeed we belong to Allah, and indeed to Him we will return.\'" - Quran 2:155-156'
            }
        elif any(word in content_lower for word in ['grateful', 'thankful', 'blessed', 'joy']):
            return {
                'title': 'Gratitude to Allah',
                'content': 'Your gratitude pleases Allah. Continue to remember His countless blessings and praise Him for His goodness in your life.',
                'scripture_reference': '"And [remember] when your Lord proclaimed, \'If you are grateful, I will certainly give you more.\'" - Quran 14:7'
            }
        else:
            return {
                'title': 'Seeking Allah\'s Guidance',
                'content': 'Continue to seek Allah\'s guidance in all aspects of your life. Regular prayer and dhikr will strengthen your connection with Him.',
                'scripture_reference': '"And it is He who created the heavens and earth in truth. And the day He says, \'Be,\' and it is, His word is the truth." - Quran 6:73'
            }

class JournalEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JournalEntryWithInsightsSerializer
    permission_classes = [permissions.AllowAny]  # Allow testing without auth
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return JournalEntry.objects.filter(user=self.request.user)
        else:
            # For testing - use test user
            from django.contrib.auth.models import User
            user, created = User.objects.get_or_create(username='testuser', defaults={'email': 'test@example.com'})
            return JournalEntry.objects.filter(user=user)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Allow testing without auth
def dashboard_stats(request):
    """Get dashboard statistics for the user"""
    if request.user.is_authenticated:
        entries = JournalEntry.objects.filter(user=request.user)
    else:
        # For testing - use test user
        from django.contrib.auth.models import User
        user, created = User.objects.get_or_create(username='testuser', defaults={'email': 'test@example.com'})
        entries = JournalEntry.objects.filter(user=user)
    
    # Calculate stats
    total_entries = entries.count()
    avg_mood = entries.exclude(mood_rating__isnull=True).aggregate(
        avg_mood=models.Avg('mood_rating')
    )['avg_mood'] or 0
    
    # Recent entries with sentiment trends
    recent_entries = entries[:7]  # Last 7 entries
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