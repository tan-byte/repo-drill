from dataclasses import dataclass, field
from typing import Any


@dataclass
class WebhookEvent:
    id: str
    target_url: str
    payload: dict[str, Any]
    status: str = "pending"  # "pending", "delivered", "dead_letter"
    attempts_made: int = 0
    delays_recorded: list[float] = field(default_factory=list)


@dataclass
class DispatchResult:
    success: bool
    status: str
    attempts: int
