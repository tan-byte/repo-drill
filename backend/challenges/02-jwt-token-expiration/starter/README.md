# Security Vulnerability Report: SEC-304

## Overview
During an internal penetration test, two security flaws were uncovered in the core authentication microservice:

1. **Acceptance of Expired Tokens**:
   In `auth.py`, `verify_token` decodes the token payload and validates the signature, but fails to check whether the token's expiration timestamp (`exp`) has elapsed. Even tokens issued years ago are treated as valid!

2. **Broken Role-Based Access Control (RBAC)**:
   In `middleware.py`, the `require_role` guard checks if the user has *any* role set instead of verifying that the user specifically possesses the `required_role`. A standard `"viewer"` or `"member"` user can access endpoints guarded by `"admin"`!

## Requirements
1. In `auth.py`:
   - In `verify_token(token_str: str, current_time: float | None = None) -> TokenPayload | None`:
     - If `payload.exp <= now`, token is expired. Return `None` (or raise `TokenExpiredError`).
     - If token format is invalid or signature check fails, return `None`.
2. In `middleware.py`:
   - Implement `check_permission(user: User, required_role: str) -> bool`:
     - Must return `True` if and only if `user.role == required_role` or `"superadmin"` is present.
     - Return `False` if user is `None` or role does not match.
3. Keep code clean and PEP8 compliant.
