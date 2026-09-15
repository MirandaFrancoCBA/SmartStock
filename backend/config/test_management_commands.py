import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.core.management.base import CommandError


@pytest.mark.django_db
def test_bootstrap_roles_creates_expected_groups():
    call_command("bootstrap_roles")

    assert set(Group.objects.filter(name__in=["Admin", "Staff", "Viewer"]).values_list("name", flat=True)) == {
        "Admin",
        "Staff",
        "Viewer",
    }


@pytest.mark.django_db
def test_bootstrap_roles_assigns_existing_user_and_replaces_smartstock_role():
    User = get_user_model()
    user = User.objects.create_user(username="operator", password="test-pass")
    unrelated = Group.objects.create(name="Unrelated")
    old_role = Group.objects.create(name="Viewer")
    user.groups.add(unrelated, old_role)

    call_command("bootstrap_roles", username="operator", role="Staff")

    assert set(user.groups.values_list("name", flat=True)) == {"Unrelated", "Staff"}


@pytest.mark.django_db
def test_bootstrap_roles_requires_username_and_role_together():
    with pytest.raises(CommandError):
        call_command("bootstrap_roles", username="operator")


@pytest.mark.django_db
def test_bootstrap_roles_rejects_unknown_user():
    with pytest.raises(CommandError, match="does not exist"):
        call_command("bootstrap_roles", username="missing", role="Admin")
