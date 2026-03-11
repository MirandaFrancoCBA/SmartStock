from rest_framework import viewsets
from .models import InventoryMovement
from .serializers import InventoryMovementSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

from services.inventory_service import (
    get_inventory_value,
    get_low_stock_products,
    get_top_products
)
from .permissions import InventoryPermission


class InventoryMovementViewSet(viewsets.ModelViewSet):
    queryset = InventoryMovement.objects.all()
    serializer_class = InventoryMovementSerializer
    permission_classes = [InventoryPermission]
    
#Valor total del inventario
    
@api_view(["GET"])
def inventory_value_report(request):

    data = get_inventory_value()

    return Response(data)

#Productos con bajo stock

@api_view(["GET"])
def low_stock_report(request):

    data = get_low_stock_products()

    return Response(data)

#Productos con mas stock

@api_view(["GET"])
def top_products_report(request):

    data = get_top_products()

    return Response(data)

