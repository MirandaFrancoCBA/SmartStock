from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F

from products.models import Product
from .permissions import InventoryPermission

@api_view(["GET"])
@permission_classes([InventoryPermission])
def inventory_value(request):

    total_value = Product.objects.aggregate(
        total=Sum(F("price") * F("stock"))
    )

    return Response({
        "total_inventory_value": total_value["total"]
    })
    
@api_view(["GET"])
@permission_classes([InventoryPermission])
def low_stock_products(request):

    threshold = request.GET.get("threshold", 10)

    products = Product.objects.filter(stock__lte=threshold)

    data = [
        {
            "id": p.id,
            "name": p.name,
            "stock": p.stock
        }
        for p in products
    ]

    return Response(data)


@api_view(["GET"])
@permission_classes([InventoryPermission])
def top_products(request):

    limit = request.GET.get("limit", 5)

    products = Product.objects.order_by("-stock")[:int(limit)]

    data = [
        {
            "id": p.id,
            "name": p.name,
            "stock": p.stock
        }
        for p in products
    ]

    return Response(data)