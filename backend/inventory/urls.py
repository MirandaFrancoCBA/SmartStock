from django.urls import path
from .views import (
    inventory_value_view,
    low_stock_products_view,
    top_products_view
)

urlpatterns = [
    path("value/", inventory_value_view),
    path("low-stock/", low_stock_products_view),
    path("top-products/", top_products_view),
]