from rest_framework.permissions import BasePermission, SAFE_METHODS


class InventoryPermission(BasePermission):

    """
    Permissions for inventory movements.

    Viewer → read only
    Staff → create movements
    Admin → full access
    """

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return user.groups.filter(
                name__in=["Admin", "Staff", "Viewer"]
            ).exists()

        if request.method == "POST":
            return user.groups.filter(
                name__in=["Admin", "Staff"]
            ).exists()

        if request.method == "DELETE":
            return user.groups.filter(name="Admin").exists()

        return False