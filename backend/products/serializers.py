from rest_framework import serializers
from .models import Category, Supplier, Product, StockMovement


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):

    category_name = serializers.ReadOnlyField(source="category.name")
    supplier_name = serializers.ReadOnlyField(source="supplier.name")
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = "__all__"

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = StockMovement
        fields = ['id', 'product_name', 'user_name', 'quantity', 'movement_type', 'notes', 'created_at']

