import pytest # type: ignore
from rest_framework.test import APIClient
from django.contrib.auth.models import User, Group
from inventory.tests.factories import ProductFactory


@pytest.mark.django_db
def test_inventory_value():


    admin_group = Group.objects.create(name="Admin")

    user = User.objects.create_user(
        username="admin",
        password="testpass"
    )

    user.groups.add(admin_group)

    ProductFactory(price=10, stock=5)
    ProductFactory(price=20, stock=2)

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get("/api/reports/inventory-value/")

    assert response.status_code == 200
    assert response.data["total_inventory_value"] == 90