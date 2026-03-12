from django.db.models import Sum, F
from products.models import Product
import logging

def get_inventory_value():

    logger.info("Calculating total inventory value")
    result = Product.objects.aggregate(
        total=Sum(F("price") * F("stock"))
    )

    logger.info(f"Inventory value calculated: {result['total']}")
    return {
        "total_inventory_value": result["total"]
    }


def get_low_stock_products(threshold=10):

    try:

        logger.info(f"Fetching products with stock <= {threshold}")

        products = Product.objects.filter(stock__lte=threshold)

        data = [
            {
                "id": p.id,
                "name": p.name,
                "stock": p.stock
            }
            for p in products
        ]

        logger.info(f"{len(data)} low stock products found")

        return data

    except Exception as e:

        logger.error(f"Error fetching low stock products: {e}")

        raise


def get_top_products(limit=5):

    try:

        logger.info(f"Fetching top {limit} products by stock")

        products = Product.objects.order_by("-stock")[:limit]

        data = [
            {
                "id": p.id,
                "name": p.name,
                "stock": p.stock
            }
            for p in products
        ]

        logger.info("Top products report generated")

        return data

    except Exception as e:

        logger.error(f"Error generating top products report: {e}")

        raise
    

logger = logging.getLogger("smartstock")