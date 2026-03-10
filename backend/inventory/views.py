from rest_framework import viewsets
from .models import InventoryMovement
from .serializers import InventoryMovementSerializer


class InventoryMovementViewSet(viewsets.ModelViewSet):
    queryset = InventoryMovement.objects.all()
    serializer_class = InventoryMovementSerializer