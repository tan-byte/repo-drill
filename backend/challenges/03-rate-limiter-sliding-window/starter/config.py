from dataclasses import dataclass


@dataclass
class RateLimitConfig:
    max_requests: int = 5
    window_seconds: float = 60.0
