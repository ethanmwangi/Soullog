# backend/soul_log/models.py

from django.db import models
from django.contrib.auth.models import User
import json

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    prefer_biblical = models.BooleanField(default=True)
    prefer_islamic = models.BooleanField(default=True)
    prefer_psychological = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class JournalEntry(models.Model):
    MOOD_CHOICES = [
        (1, 'Very Sad'),
        (2, 'Sad'),
        (3, 'Neutral'),
        (4, 'Happy'),
        (5, 'Very Happy'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    mood_rating = models.IntegerField(choices=MOOD_CHOICES, null=True, blank=True)
    emotions = models.CharField(max_length=500, blank=True)  # Comma-separated emotions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # AI Analysis fields
    sentiment_score = models.FloatField(null=True, blank=True)  # -1 to 1
    detected_emotions = models.TextField(blank=True)  # JSON string
    keywords = models.TextField(blank=True)  # Comma-separated keywords
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"
    
    def get_emotions_list(self):
        if self.emotions:
            return [emotion.strip() for emotion in self.emotions.split(',')]
        return []
    
    def get_detected_emotions(self):
        if self.detected_emotions:
            try:
                return json.loads(self.detected_emotions)
            except:
                return {}
        return {}

class InsightTemplate(models.Model):
    INSIGHT_TYPES = [
        ('psychological', 'Psychological'),
        ('biblical', 'Biblical'),
        ('islamic', 'Islamic'),
    ]
    
    keyword = models.CharField(max_length=100)  # trigger keyword
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    scripture_reference = models.CharField(max_length=200, blank=True)  # For religious insights
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['keyword', 'insight_type']
    
    def __str__(self):
        return f"{self.insight_type} - {self.keyword}"

class GeneratedInsight(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='insights')
    insight_type = models.CharField(max_length=20, choices=InsightTemplate.INSIGHT_TYPES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    scripture_reference = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.insight_type} insight for {self.journal_entry}"