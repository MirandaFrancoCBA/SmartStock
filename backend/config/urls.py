from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from products.views import CategoryViewSet, SupplierViewSet, ProductViewSet
from inventory.views import InventoryMovementViewSet
from drf_spectacular.views import ( # type: ignore
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

router = DefaultRouter()

router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'products', ProductViewSet)
router.register(r'movements', InventoryMovementViewSet)

urlpatterns = [

    path('admin/', admin.site.urls),

    path('api/', include(router.urls)),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui'
    ),

    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='schema'),
        name='redoc'
    ),
]