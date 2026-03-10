from rest_framework import serializers
from .models import Category, Supplier, Product


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

    class Meta:
        model = Product
        fields = "__all__"