# Business-rule coverage for inventory movements.
import pytest
from django.contrib.auth.models import Group


@pytest.fixture
def staff_user(user):
    group = Group.objects.create(name="Staff")
    user.groups.add(group)
    return user


@pytest.mark.django_db
def test_in_movement_increases_stock(api_client, product, staff_user):
    api_client.force_authenticate(user=staff_user)

    response = api_client.post(
        "/api/inventory-movements/",
        {
            "product": product.id,
            "movement_type": "IN",
            "quantity": 3,
            "note": "Restock test",
        },
        format="json",
    )

    assert response.status_code == 201
    product.refresh_from_db()
    assert product.stock == 8
    assert response.data["user"] == staff_user.id


@pytest.mark.django_db
def test_out_movement_decreases_stock(api_client, product, staff_user):
    api_client.force_authenticate(user=staff_user)

    response = api_client.post(
        "/api/inventory-movements/",
        {
            "product": product.id,
            "movement_type": "OUT",
            "quantity": 2,
            "note": "Sale test",
        },
        format="json",
    )

    assert response.status_code == 201
    product.refresh_from_db()
    assert product.stock == 3


@pytest.mark.django_db
def test_movement_rejects_non_positive_quantity(api_client, product, staff_user):
    api_client.force_authenticate(user=staff_user)

    response = api_client.post(
        "/api/inventory-movements/",
        {
            "product": product.id,
            "movement_type": "IN",
            "quantity": 0,
        },
        format="json",
    )

    assert response.status_code == 400
    product.refresh_from_db()
    assert product.stock == 5


@pytest.mark.django_db
def test_out_movement_rejects_insufficient_stock(api_client, product, staff_user):
    api_client.force_authenticate(user=staff_user)

    response = api_client.post(
        "/api/inventory-movements/",
        {
            "product": product.id,
            "movement_type": "OUT",
            "quantity": 6,
        },
        format="json",
    )

    assert response.status_code == 400
    product.refresh_from_db()
    assert product.stock == 5
