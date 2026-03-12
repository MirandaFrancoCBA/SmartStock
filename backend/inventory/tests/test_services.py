import pytest # type: ignore
from products.models import Product, Category, Supplier
from services.inventory_service import get_inventory_value


@pytest.mark.django_db
def test_inventory_value():

    category = Category.objects.create(
        name="Test Category"
    )

    supplier = Supplier.objects.create(
        name="Test Supplier"
    )

    Product.objects.create(
        name="Test Product 1",
        sku="SKU001",
        category=category,
        supplier=supplier,
        price=10,
        stock=5
    )

    Product.objects.create(
        name="Test Product 2",
        sku="SKU002",
        category=category,
        supplier=supplier,
        price=20,
        stock=2
    )

    result = get_inventory_value()

    assert result["total_inventory_value"] == 90