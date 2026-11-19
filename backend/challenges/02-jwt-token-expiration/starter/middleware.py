from models import User


def check_permission(user: User | None, required_role: str) -> bool:
    """Verifies that the authenticated user possesses the required role.

    Superadmins always have full access.
    """
    if not user:
        return False

    # BUG: Returns True if user has ANY role set, regardless of what required_role is!
    # A standard "guest" or "viewer" can access "admin" routes!
    if user.role:
        return True

    return False
