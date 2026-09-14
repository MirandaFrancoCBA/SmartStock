# Authorization coverage for inventory roles.
import pytest
from django.contrib.auth.models import Group
from inventory.models import InventoryMovement


def add_role(user, role_name):
    group = Group.objects.create(name=role_name)
    user.groups.add(group)
    return user


@pytest.mark.django_db
def test_viewer_can_read_inventory_movements(api_client, user):
    add_role(user, "Viewer")
    api_client.force_authenticate(user=user)

    response = api_client.get("/api/inventory-movements/")

    assert response.status_code == 200


@pytest.mark.django_db
def test_viewer_cannot_create_inventory_movement(api_client, user, product):
    add_role(user, "Viewer")
    api_client.force_authenticate(user=user)

    response = api_client.post(
        "/api/inventory-movements/",
        {
            "product": product.id,
            "movement_type": "IN",
            "quantity": 1,
        },
        format="json",
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_staff_can_create_but_cannot_delete_movement(api_client, user, product):
    add_role(user, "Staff")
    api_client.force_authenticate(user=user)

    create_response = api_client.post(
        "/api/inventory-movements/",
        {
            "product": product.id,
            "movement_type": "IN",
            "quantity": 1,
        },
        format="json",
    )

    assert create_response.status_code == 201
    movement_id = create_response.data["id"]

    delete_response = api_client.delete(
        f"/api/inventory-movements/{movement_id}/"
    )

    assert delete_response.status_code == 403


@pytest.mark.django_db
def test_admin_can_delete_movement(api_client, user, product):
    add_role(user, "Admin")
    movement = InventoryMovement.objects.create(
        product=product,
        movement_type="IN",
        quantity=1,
        user=user,
    )
    api_client.force_authenticate(user=user)

    response = api_client.delete(
        f"/api/inventory-movements/{movement.id}/"
    )

    assert response.status_code == 204


@pytest.mark.django_db
def test_authenticated_user_without_role_is_forbidden(api_client, user):
    api_client.force_authenticate(user=user)

    response = api_client.get("/api/inventory-movements/")

    assert response.status_code == 403


@pytest.mark.django_db
def test_unauthenticated_user_cannot_read_inventory_movements(api_client):
    response = api_client.get("/api/inventory-movements/")

    assert response.status_code == 401
