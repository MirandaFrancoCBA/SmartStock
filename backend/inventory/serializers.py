from rest_framework import serializers
from .models import InventoryMovement


class InventoryMovementSerializer(serializers.ModelSerializer):

    product_name = serializers.ReadOnlyField(source="product.name")
    user_username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = InventoryMovement
        fields = "__all__"