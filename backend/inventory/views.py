from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import logging
from .models import InventoryMovement
from .serializers import InventoryMovementSerializer
from .permissions import InventoryPermission

from services.inventory_service import (
    get_inventory_value,
    get_low_stock_products,
    get_top_products
)


class InventoryMovementViewSet(viewsets.ModelViewSet):

    queryset = InventoryMovement.objects.all()
    serializer_class = InventoryMovementSerializer
    permission_classes = [InventoryPermission]


@api_view(["GET"])
@permission_classes([InventoryPermission])
def inventory_value_report(request):

    logger.info(
        f"User {request.user} requested inventory value report"
    )

    data = get_inventory_value()

    return Response(data)

@api_view(["GET"])
@permission_classes([InventoryPermission])
def low_stock_report(request):

    logger.info(
        f"User {request.user} requested low stock report"
    )

    data = get_low_stock_products()

    return Response(data)

@api_view(["GET"])
@permission_classes([InventoryPermission])
def top_products_report(request):

    logger.info(
        f"User {request.user} requested top products report"
    )

    data = get_top_products()

    return Response(data)

logger = logging.getLogger("smartstock")