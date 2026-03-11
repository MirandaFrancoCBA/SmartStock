from django.db.models import Sum, F
from products.models import Product


def get_inventory_value():

    products = Product.objects.annotate(
        total_value=F("price") * F("stock")
    )

    total_inventory_value = products.aggregate(
        total=Sum("total_value")
    )

    return {
        "total_inventory_value": total_inventory_value["total"]
    }


def get_low_stock_products(threshold=5):

    products = Product.objects.filter(
        stock__lte=threshold
    ).values(
        "id",
        "name",
        "sku",
        "stock"
    )

    return list(products)


def get_top_products(limit=5):

    products = Product.objects.order_by(
        "-stock"
    ).values(
        "id",
        "name",
        "sku",
        "stock"
    )[:limit]

    return list(products)