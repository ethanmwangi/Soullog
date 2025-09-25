# backend/soul_log/urls.py

from django.urls import path
from . import views, authentication

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', authentication.register, name='register'),
    path('auth/login/', authentication.login_view, name='login'),
    path('auth/logout/', authentication.logout_view, name='logout'),
    path('auth/me/', authentication.current_user, name='current-user'),
    
    # Main app endpoints
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('entries/', views.JournalEntryListCreateView.as_view(), name='journal-entries'),
    path('entries/<int:pk>/', views.JournalEntryDetailView.as_view(), name='journal-entry-detail'),
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
]
