# backend/soul_log/authentication.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .serializers import UserRegistrationSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and return a token."""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user and return token"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Email and password required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate using email to find the user, then the user's username for the actual authentication.
    try:
        user = User.objects.get(email=email)
        authenticated_user = authenticate(username=user.username, password=password)
    except User.DoesNotExist:
        authenticated_user = None

    if authenticated_user is not None:
        token, created = Token.objects.get_or_create(user=authenticated_user)
        return Response({
            'token': token.key,
            'user_id': authenticated_user.pk,
            'username': authenticated_user.username,
            'email': authenticated_user.email
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user by deleting their token."""
    try:
        # Simply delete the token to force a login
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except (AttributeError, Token.DoesNotExist):
        return Response({'error': 'No token found for user.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current user details."""
    return Response({
        'user_id': request.user.pk,
        'username': request.user.username,
        'email': request.user.email
    })
