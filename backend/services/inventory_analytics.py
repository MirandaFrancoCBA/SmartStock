from products.models import Product
from django.db.models import F, Sum


def get_low_stock_products(threshold=5):
    """
    Returns products with stock lower than threshold.
    """

    products = Product.objects.filter(stock__lt=threshold)

    return [
        {
            "name": product.name,
            "sku": product.sku,
            "stock": product.stock
        }
        for product in products
    ]


def get_top_products(limit=5):
    """
    Returns products with highest stock.
    """

    products = Product.objects.order_by("-stock")[:limit]

    return [
        {
            "name": product.name,
            "sku": product.sku,
            "stock": product.stock
        }
        for product in products
    ]


def get_inventory_value():
    """
    Calculates total inventory value.
    """

    result = Product.objects.aggregate(
        total=Sum(F("price") * F("stock"))
    )

    return {
        "total_inventory_value": result["total"] or 0
    }