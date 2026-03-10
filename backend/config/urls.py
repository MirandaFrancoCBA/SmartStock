from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from products.views import CategoryViewSet, SupplierViewSet, ProductViewSet
from inventory.views import InventoryMovementViewSet

router = DefaultRouter()

router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'products', ProductViewSet)
router.register(r'movements', InventoryMovementViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]