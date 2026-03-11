from rest_framework import serializers
from .models import InventoryMovement


class InventoryMovementSerializer(serializers.ModelSerializer):

    product_name = serializers.ReadOnlyField(source="product.name")
    user_username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = InventoryMovement
        fields = "__all__"
        
    

    def validate(self, data):

        product = data["product"]
        movement_type = data["movement_type"]
        quantity = data["quantity"]

        if quantity <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero"
            )

        if movement_type == "OUT" and quantity > product.stock:
            raise serializers.ValidationError(
                "Cannot remove more stock than available"
            )

        return data