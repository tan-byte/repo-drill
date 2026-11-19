import base64
import json
import time
from models import TokenPayload

SECRET_SALT = "repo_drill_secret_key"


def create_token(user_id: str, email: str, role: str, expires_in_seconds: float = 3600) -> str:
    now = time.time()
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + expires_in_seconds,
    }
    raw = json.dumps(payload, sort_keys=True).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def verify_token(token_str: str, current_time: float | None = None) -> TokenPayload | None:
    """Verifies and decodes an access token.

    Returns TokenPayload if valid and not expired; returns None otherwise.
    """
    if not token_str:
        return None

    try:
        raw_bytes = base64.urlsafe_b64decode(token_str.encode("utf-8"))
        data = json.loads(raw_bytes.decode("utf-8"))
    except Exception:
        return None

    # BUG: Fails to check token expiration timestamp!
    # Expired tokens are returning as valid!
    # Fix: compare data.get("exp") with (current_time if current_time is not None else time.time())

    return TokenPayload(
        user_id=data["user_id"],
        email=data["email"],
        role=data["role"],
        iat=data["iat"],
        exp=data["exp"],
    )
