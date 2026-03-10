from django.db import models
from products.models import Product
from django.contrib.auth.models import User


class InventoryMovement(models.Model):

    MOVEMENT_TYPES = (
        ("IN", "Entrada"),
        ("OUT", "Salida"),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=3, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.product.name} - {self.movement_type} ({self.quantity})"