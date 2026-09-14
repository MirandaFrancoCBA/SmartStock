# Report endpoint coverage for inventory analytics.
import pytest
from django.contrib.auth.models import Group
from products.models import Product


@pytest.fixture
def report_user(user):
    group = Group.objects.create(name="Admin")
    user.groups.add(group)
    return user


@pytest.mark.django_db
def test_low_stock_report_returns_products_under_default_threshold(
    api_client, category, supplier, report_user
):
    low = Product.objects.create(
        name="Low stock",
        sku="LOW-001",
        category=category,
        supplier=supplier,
        price=10,
        stock=4,
    )
    Product.objects.create(
        name="Healthy stock",
        sku="OK-001",
        category=category,
        supplier=supplier,
        price=10,
        stock=20,
    )
    api_client.force_authenticate(user=report_user)

    response = api_client.get("/api/reports/low-stock/")

    assert response.status_code == 200
    returned_ids = {item["id"] for item in response.data}
    assert low.id in returned_ids


@pytest.mark.django_db
def test_top_products_report_orders_by_stock_descending(
    api_client, category, supplier, report_user
):
    Product.objects.create(
        name="Medium",
        sku="MED-001",
        category=category,
        supplier=supplier,
        price=10,
        stock=10,
    )
    top = Product.objects.create(
        name="Top",
        sku="TOP-001",
        category=category,
        supplier=supplier,
        price=10,
        stock=30,
    )
    api_client.force_authenticate(user=report_user)

    response = api_client.get("/api/reports/top-products/")

    assert response.status_code == 200
    assert response.data[0]["id"] == top.id
    assert response.data[0]["stock"] == 30


@pytest.mark.django_db
def test_reports_require_valid_role(api_client, user):
    api_client.force_authenticate(user=user)

    for endpoint in (
        "/api/reports/inventory-value/",
        "/api/reports/low-stock/",
        "/api/reports/top-products/",
    ):
        response = api_client.get(endpoint)
        assert response.status_code == 403


@pytest.mark.django_db
def test_empty_reports_return_stable_responses(api_client, report_user):
    api_client.force_authenticate(user=report_user)

    low_stock = api_client.get("/api/reports/low-stock/")
    top_products = api_client.get("/api/reports/top-products/")
    inventory_value = api_client.get("/api/reports/inventory-value/")

    assert low_stock.status_code == 200
    assert low_stock.data == []
    assert top_products.status_code == 200
    assert top_products.data == []
    assert inventory_value.status_code == 200
    assert inventory_value.data["total_inventory_value"] is None
