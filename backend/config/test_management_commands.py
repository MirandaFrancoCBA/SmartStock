import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.core.management.base import CommandError


@pytest.mark.django_db
def test_seed_roles_creates_expected_groups():
    call_command("seed_roles")

    assert set(Group.objects.filter(name__in=["Admin", "Staff", "Viewer"]).values_list("name", flat=True)) == {
        "Admin",
        "Staff",
        "Viewer",
    }


@pytest.mark.django_db
def test_seed_roles_assigns_existing_user_and_replaces_smartstock_role():
    User = get_user_model()
    user = User.objects.create_user(username="operator", password="test-pass")
    unrelated = Group.objects.create(name="Unrelated")
    old_role = Group.objects.create(name="Viewer")
    user.groups.add(unrelated, old_role)

    call_command("seed_roles", username="operator", role="Staff")
    user.refresh_from_db()

    assert set(user.groups.values_list("name", flat=True)) == {"Unrelated", "Staff"}


@pytest.mark.django_db
def test_seed_roles_requires_username_and_role_together():
    with pytest.raises(CommandError):
        call_command("seed_roles", username="operator")


@pytest.mark.django_db
def test_seed_roles_rejects_unknown_user():
    with pytest.raises(CommandError, match="does not exist"):
        call_command("seed_roles", username="missing", role="Admin")


@pytest.mark.django_db
def test_seed_demo_users_skips_when_not_configured(monkeypatch):
    for name in (
        "SMARTSTOCK_DEMO_ADMIN_USERNAME",
        "SMARTSTOCK_DEMO_ADMIN_PASSWORD",
        "SMARTSTOCK_DEMO_STAFF_USERNAME",
        "SMARTSTOCK_DEMO_STAFF_PASSWORD",
        "SMARTSTOCK_DEMO_VIEWER_USERNAME",
        "SMARTSTOCK_DEMO_VIEWER_PASSWORD",
    ):
        monkeypatch.delenv(name, raising=False)

    call_command("seed_demo_users")
    assert get_user_model().objects.count() == 0


@pytest.mark.django_db
def test_seed_demo_users_creates_user_with_role(monkeypatch):
    call_command("seed_roles")
    monkeypatch.setenv("SMARTSTOCK_DEMO_VIEWER_USERNAME", "demo_viewer")
    monkeypatch.setenv("SMARTSTOCK_DEMO_VIEWER_PASSWORD", "safe-demo-password")

    call_command("seed_demo_users")

    user = get_user_model().objects.get(username="demo_viewer")
    assert user.check_password("safe-demo-password")
    assert set(user.groups.values_list("name", flat=True)) == {"Viewer"}


@pytest.mark.django_db
def test_seed_demo_users_rejects_partial_credentials(monkeypatch):
    monkeypatch.setenv("SMARTSTOCK_DEMO_ADMIN_USERNAME", "demo_admin")
    monkeypatch.delenv("SMARTSTOCK_DEMO_ADMIN_PASSWORD", raising=False)

    with pytest.raises(CommandError, match="must be configured together"):
        call_command("seed_demo_users")
