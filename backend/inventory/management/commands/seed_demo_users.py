import os

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError


DEMO_USERS = (
    ("Admin", "SMARTSTOCK_DEMO_ADMIN_USERNAME", "SMARTSTOCK_DEMO_ADMIN_PASSWORD"),
    ("Staff", "SMARTSTOCK_DEMO_STAFF_USERNAME", "SMARTSTOCK_DEMO_STAFF_PASSWORD"),
    ("Viewer", "SMARTSTOCK_DEMO_VIEWER_USERNAME", "SMARTSTOCK_DEMO_VIEWER_PASSWORD"),
)


class Command(BaseCommand):
    help = "Create or update SmartStock demo users from environment variables."

    def handle(self, *args, **options):
        configured = []
        for role, username_var, password_var in DEMO_USERS:
            username = os.getenv(username_var)
            password = os.getenv(password_var)

            if not username and not password:
                continue
            if not username or not password:
                raise CommandError(
                    f"{username_var} and {password_var} must be configured together."
                )
            configured.append((role, username, password))

        if not configured:
            self.stdout.write("No demo-user environment variables configured; skipping.")
            return

        groups = {group.name: group for group in Group.objects.filter(name__in=["Admin", "Staff", "Viewer"])}
        missing_roles = {role for role, _, _ in configured} - groups.keys()
        if missing_roles:
            raise CommandError(
                "Missing SmartStock roles: " + ", ".join(sorted(missing_roles)) + ". Run seed_roles first."
            )

        User = get_user_model()
        smartstock_groups = list(groups.values())
        for role, username, password in configured:
            user, created = User.objects.get_or_create(username=username)
            user.set_password(password)
            user.is_active = True
            user.save()
            user.groups.remove(*smartstock_groups)
            user.groups.add(groups[role])
            status = "created" if created else "updated"
            self.stdout.write(f'{username}: {status} as {role}')

        self.stdout.write(self.style.SUCCESS("SmartStock demo users are ready."))
