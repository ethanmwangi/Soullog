
from django.urls import path
from .views import (
    UserProfileView, 
    JournalEntryListCreateView, 
    JournalEntryDetailView, 
    dashboard_stats,
    UserRegistrationView
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('journal-entries/', JournalEntryListCreateView.as_view(), name='journal-entry-list'),
    path('journal-entries/<int:pk>/', JournalEntryDetailView.as_view(), name='journal-entry-detail'),
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
]
