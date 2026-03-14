import pytest # type: ignore
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User, Group


@pytest.mark.django_db
def test_login_returns_token():

    client = APIClient()

    User.objects.create_user(
        username="testuser",
        password="testpass123"
    )

    response = client.post(
        "/api/token/",
        {
            "username": "testuser",
            "password": "testpass123"
        }
    )

    assert response.status_code == 200
    assert "access" in response.data
    
@pytest.mark.django_db
def test_products_requires_auth():

    client = APIClient()

    response = client.get("/api/products/")

    assert response.status_code == 401
    
@pytest.mark.django_db
def test_products_with_token():


    admin_group = Group.objects.create(name="Admin")

    user = User.objects.create_user(
        username="testuser",
        password="testpass123"
    )

    user.groups.add(admin_group)

    client = APIClient()

    login = client.post(
        "/api/token/",
        {
            "username": "testuser",
            "password": "testpass123"
        }
    )

    token = login.data["access"]

    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}"
    )

    response = client.get("/api/products/")

    assert response.status_code == 200