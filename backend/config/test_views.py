import pytest
from django.contrib.auth.models import Group


@pytest.mark.django_db
def test_current_user_requires_authentication(api_client):
    response = api_client.get("/api/me/")

    assert response.status_code == 401


@pytest.mark.django_db
def test_current_user_returns_identity_and_groups(api_client, user):
    staff = Group.objects.create(name="Staff")
    user.groups.add(staff)
    api_client.force_authenticate(user=user)

    response = api_client.get("/api/me/")

    assert response.status_code == 200
    assert response.data["id"] == user.id
    assert response.data["username"] == user.username
    assert response.data["email"] == user.email
    assert response.data["groups"] == ["Staff"]
