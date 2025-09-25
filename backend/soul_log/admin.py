from django.contrib import admin
from .models import UserProfile, JournalEntry, GeneratedInsight, InsightTemplate

# Corrected admin registration using the actual field names from your models.py

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'prefer_biblical', 'prefer_islamic', 'prefer_psychological')
    search_fields = ('user__username',)

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'mood_rating', 'sentiment_score')
    list_filter = ('created_at', 'mood_rating', 'user')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'

@admin.register(GeneratedInsight)
class GeneratedInsightAdmin(admin.ModelAdmin):
    # Corrected: Using 'journal_entry' which is the correct field name.
    list_display = ('journal_entry', 'insight_type', 'title', 'created_at')
    list_filter = ('insight_type',)
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'

@admin.register(InsightTemplate)
class InsightTemplateAdmin(admin.ModelAdmin):
    # Added for managing the templates for generating insights.
    list_display = ('keyword', 'insight_type', 'title', 'is_active')
    list_filter = ('insight_type', 'is_active')
    search_fields = ('keyword', 'title', 'content')
