from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError


ROLE_NAMES = ("Admin", "Staff", "Viewer")


class Command(BaseCommand):
    help = "Create SmartStock RBAC groups and optionally assign a user to one role."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            help="Existing username to assign to a SmartStock role.",
        )
        parser.add_argument(
            "--role",
            choices=ROLE_NAMES,
            help="Role to assign. Requires --username.",
        )

    def handle(self, *args, **options):
        groups = {}
        for role_name in ROLE_NAMES:
            group, created = Group.objects.get_or_create(name=role_name)
            groups[role_name] = group
            status = "created" if created else "already exists"
            self.stdout.write(f"{role_name}: {status}")

        username = options.get("username")
        role = options.get("role")

        if bool(username) != bool(role):
            raise CommandError("--username and --role must be provided together.")

        if not username:
            self.stdout.write(self.style.SUCCESS("SmartStock RBAC groups are ready."))
            return

        User = get_user_model()
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist as exc:
            raise CommandError(f'User "{username}" does not exist.') from exc

        # SmartStock roles are mutually exclusive. Keep unrelated Django groups intact.
        user.groups.remove(*groups.values())
        user.groups.add(groups[role])
        self.stdout.write(
            self.style.SUCCESS(f'Assigned "{username}" to SmartStock role "{role}".')
        )
