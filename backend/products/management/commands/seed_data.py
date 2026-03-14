from django.core.management.base import BaseCommand
from faker import Faker # type: ignore
import random

from products.models import Category, Supplier, Product


class Command(BaseCommand):
    help = "Generate fake data for development"

    def handle(self, *args, **kwargs):

        fake = Faker()

        self.stdout.write("Creating categories...")

        categories = []

        for _ in range(5):
            category = Category.objects.create(
                name=fake.word().capitalize()
            )
            categories.append(category)

        self.stdout.write("Creating suppliers...")

        suppliers = []

        for _ in range(5):
            supplier = Supplier.objects.create(
                name=fake.company()
            )
            suppliers.append(supplier)

        self.stdout.write("Creating products...")

        for i in range(100):

            Product.objects.create(
                name=fake.word().capitalize(),
                sku=f"SKU-{i}",
                category=random.choice(categories),
                supplier=random.choice(suppliers),
                price=random.randint(5, 100),
                stock=random.randint(0, 50)
            )

        self.stdout.write(
            self.style.SUCCESS("Database seeded successfully!")
        )