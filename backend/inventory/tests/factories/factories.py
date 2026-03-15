import factory # type: ignore
from products.models import Product, Category, Supplier
from django.contrib.auth.models import User


class CategoryFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = Category

    name = factory.Faker("word")


class SupplierFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = Supplier

    name = factory.Faker("company")


class ProductFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = Product

    name = factory.Faker("word")
    sku = factory.Faker("ean13")
    category = factory.SubFactory(CategoryFactory)
    supplier = factory.SubFactory(SupplierFactory)
    price = 10
    stock = 5


class UserFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = User

    username = factory.Faker("user_name")