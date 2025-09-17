from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('entries/', views.JournalEntryListCreateView.as_view(), name='journal-entries'),
    path('entries/<int:pk>/', views.JournalEntryDetailView.as_view(), name='journal-entry-detail'),
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
]