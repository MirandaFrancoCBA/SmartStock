from django.urls import path
from .views_reports import *

urlpatterns = [

    path("reports/inventory-value", inventory_value),
    path("reports/low-stock", low_stock_products),
    path("reports/top-products", top_products),
]