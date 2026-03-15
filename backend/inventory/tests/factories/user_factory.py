import factory # type: ignore
from django.contrib.auth.models import User, Group


class GroupFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = Group

    name = "Admin"


class UserFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = User

    username = factory.Faker("user_name")
    email = factory.Faker("email")

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        password = extracted or "testpass123"
        self.set_password(password)
        if create:
            self.save()


class AdminUserFactory(UserFactory):

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return

        admin_group, _ = Group.objects.get_or_create(name="Admin")
        self.groups.add(admin_group)