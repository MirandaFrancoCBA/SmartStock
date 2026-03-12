import pytest # type: ignore
from rest_framework.test import APIClient
from django.contrib.auth.models import User, Group



@pytest.mark.django_db
def test_inventory_value_endpoint():

    admin_group = Group.objects.create(name="Admin")

    user = User.objects.create_user(
        username="admin",
        password="testpass"
    )

    user.groups.add(admin_group)

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get("/api/reports/inventory-value/")

    assert response.status_code == 200