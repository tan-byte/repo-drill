import time
from auth import create_token, verify_token
from middleware import check_permission
from models import User


def test_valid_token_acceptance():
    token = create_token("u1", "alice@example.com", "member", expires_in_seconds=300)
    payload = verify_token(token)
    assert payload is not None
    assert payload.user_id == "u1"
    assert payload.role == "member"


def test_expired_token_rejection():
    now = time.time()
    # Token expired 10 seconds ago
    token = create_token("u2", "bob@example.com", "admin", expires_in_seconds=-10)
    payload = verify_token(token, current_time=now)
    assert payload is None, "Expired token must return None"


def test_invalid_token_format():
    assert verify_token("not-a-token") is None
    assert verify_token("") is None


def test_permission_role_matching():
    admin = User(id="u1", email="a@test.com", role="admin")
    viewer = User(id="u2", email="v@test.com", role="viewer")
    superadmin = User(id="u3", email="s@test.com", role="superadmin")

    assert check_permission(admin, "admin") is True
    assert check_permission(viewer, "admin") is False
    assert check_permission(viewer, "viewer") is True
    assert check_permission(superadmin, "admin") is True
    assert check_permission(None, "admin") is False
