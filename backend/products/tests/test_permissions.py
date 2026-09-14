import pytest
from django.contrib.auth.models import Group


def add_role(user, role_name):
    group = Group.objects.create(name=role_name)
    user.groups.add(group)
    return user


@pytest.mark.django_db
def test_viewer_can_read_categories_and_suppliers(api_client, user):
    add_role(user, "Viewer")
    api_client.force_authenticate(user=user)

    assert api_client.get("/api/categories/").status_code == 200
    assert api_client.get("/api/suppliers/").status_code == 200


@pytest.mark.django_db
def test_viewer_cannot_create_categories_or_suppliers(api_client, user):
    add_role(user, "Viewer")
    api_client.force_authenticate(user=user)

    assert api_client.post("/api/categories/", {"name": "Viewer Category"}).status_code == 403
    assert api_client.post("/api/suppliers/", {"name": "Viewer Supplier"}).status_code == 403


@pytest.mark.django_db
def test_staff_can_create_categories_and_suppliers(api_client, user):
    add_role(user, "Staff")
    api_client.force_authenticate(user=user)

    assert api_client.post("/api/categories/", {"name": "Staff Category"}).status_code == 201
    assert api_client.post("/api/suppliers/", {"name": "Staff Supplier"}).status_code == 201


@pytest.mark.django_db
def test_staff_cannot_delete_categories_or_suppliers(api_client, user, category, supplier):
    add_role(user, "Staff")
    api_client.force_authenticate(user=user)

    assert api_client.delete(f"/api/categories/{category.id}/").status_code == 403
    assert api_client.delete(f"/api/suppliers/{supplier.id}/").status_code == 403


@pytest.mark.django_db
def test_admin_can_delete_categories_and_suppliers(api_client, user, category, supplier):
    add_role(user, "Admin")
    api_client.force_authenticate(user=user)

    assert api_client.delete(f"/api/categories/{category.id}/").status_code == 204
    assert api_client.delete(f"/api/suppliers/{supplier.id}/").status_code == 204


@pytest.mark.django_db
def test_unauthenticated_user_cannot_read_categories_or_suppliers(api_client):
    assert api_client.get("/api/categories/").status_code == 401
    assert api_client.get("/api/suppliers/").status_code == 401
