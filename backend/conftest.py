import pytest # type: ignore
from products.models import Category, Supplier, Product
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """
    Cliente de testing para APIs de Django Rest Framework.
    Permite hacer requests HTTP simuladas.
    """
    return APIClient()


@pytest.fixture
def category(db):
    """
    Crea una categoría de prueba en la base de datos.
    """
    return Category.objects.create(name="Test Category")


@pytest.fixture
def supplier(db):
    """
    Crea un proveedor de prueba.
    """
    return Supplier.objects.create(name="Test Supplier")


@pytest.fixture
def product(category, supplier):
    """
    Crea un producto de prueba asociado a categoría y proveedor.
    """
    return Product.objects.create(
        name="Test Product",
        sku="SKU001",
        category=category,
        supplier=supplier,
        price=10,
        stock=5
    )


@pytest.fixture
def user(db):
    """
    Usuario normal del sistema.
    """
    return User.objects.create_user(
        username="testuser",
        password="testpass123"
    )


@pytest.fixture
def admin_user(db):
    """
    Usuario administrador para endpoints protegidos.
    """
    return User.objects.create_superuser(
        username="admin",
        password="adminpass123",
        email="admin@test.com"
    )