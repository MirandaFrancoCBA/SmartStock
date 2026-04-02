from rest_framework import viewsets
from .models import Category, Supplier, Product, StockMovement
from .serializers import (
    CategorySerializer,
    SupplierSerializer,
    ProductSerializer,
    StockMovementSerializer
)
from .permissions import ProductPermission
from rest_framework.permissions import AllowAny
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    
class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.all().order_by('-created_at')
    serializer_class = StockMovementSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    
    filterset_fields = ['category', 'supplier']

    search_fields = [
        'name',
        'sku'
    ]

    ordering_fields = [
        'price',
        'stock',
        'name'
    ]
    
    def get_queryset(self):
        queryset = Product.objects.all()
        low_stock = self.request.query_params.get('low_stock')
    
        if low_stock == 'true':
            queryset = queryset.filter(stock__lte=F('min_stock'))
    
        return queryset.order_by('name')
    
    def perform_update(self, serializer):
        instance = self.get_object()
        old_stock = instance.stock
        
        product = serializer.save()
        new_stock = product.stock

        if old_stock != new_stock:
            diff = new_stock - old_stock
            StockMovement.objects.create(
                product=product,
                user=self.request.user,
                quantity=abs(diff),
                movement_type='IN' if diff > 0 else 'OUT',
                notes="Cambio manual en edición de producto"
            )
    
    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        amount = request.data.get('amount', 0)
        notes = request.data.get('notes', 'Ajuste manual')
        
        product.stock += int(amount)
        if product.stock < 0: product.stock = 0 
        product.save()
        
        StockMovement.objects.create(
            product=product,
            user=request.user,
            quantity=abs(amount),
            movement_type='IN' if amount > 0 else 'OUT',
            notes=notes
        )
        return Response({'status': 'stock updated', 'new_stock': product.stock})