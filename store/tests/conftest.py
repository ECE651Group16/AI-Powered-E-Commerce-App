from django.contrib.auth.models import User
from rest_framework.test import APIClient
import pytest

from django.contrib.auth import get_user_model
@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticate(api_client):
    def _authenticate(is_staff=False, is_superuser=False):
        User = get_user_model()
        # Create a superuser if is_superuser is True
        if is_superuser:
            user = User.objects.create_superuser('admin', 'admin@example.com', 'password123')
        else:
            user = User.objects.create_user('user', 'user@example.com', 'password123', is_staff = is_staff)
        api_client.force_authenticate(user=user)
        return user
    return _authenticate
