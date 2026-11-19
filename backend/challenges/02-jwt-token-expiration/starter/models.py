from dataclasses import dataclass


@dataclass
class TokenPayload:
    user_id: str
    email: str
    role: str
    iat: float  # Issued at unix timestamp
    exp: float  # Expiration unix timestamp


@dataclass
class User:
    id: str
    email: str
    role: str
