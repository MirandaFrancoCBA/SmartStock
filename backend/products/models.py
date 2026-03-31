from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=150)
    sku = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=5)
    
    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name
    
    def clean(self):

        if self.price <= 0:
            raise ValidationError("Price must be greater than zero")
        
    @property
    def is_low_stock(self):
        return self.stock <= self.min_stock

    def __str__(self):
        return self.name


class StockMovement(models.Model):
    TYPES = (
        ('IN', 'Entrada'),
        ('OUT', 'Salida'),
    )

    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='movements')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    movement_type = models.CharField(max_length=3, choices=TYPES)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.movement_type} - {self.product.name} ({self.quantity})"
