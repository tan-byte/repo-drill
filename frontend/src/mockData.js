export const DEFAULT_CHALLENGES = [
  {
    id: "01-fix-discount-bug",
    title: "Fix Promo Code Calculation Bug",
    mode: "Bug Fix",
    difficulty: "Easy",
    category: "Bug Fixing",
    estimated_minutes: 10,
    tags: ["python", "e-commerce", "math", "pytest"],
    description: "Users report that applying promo code SAVE20 incorrectly deducts a flat $20 instead of 20% off their subtotal. Fix promo code calculation across cart.py and promo.py.",
    files_count: 4,
    file_names: ["README.md", "cart.py", "models.py", "promo.py"],
    hints: [
      "Check promo.py: SAVE20 currently returns flat 20.0 instead of calculating (subtotal * 0.20).",
      "Ensure cart.py properly rounds the final total to 2 decimal places and handles empty carts."
    ],
    files: {
      "README.md": `# Incident #1042: Shopping Cart Discount Bug

## Problem Description
Multiple customer support tickets report that applying the promo code \`SAVE20\` subtracts a flat **$20.00** instead of applying the promised **20% percentage discount**.

For example:
- A cart with $100.00 subtotal gets $20 off (resulting in $80), which happens to look right.
- But a cart with $50.00 subtotal currently gets $20 off (total $30) instead of $10 off (expected total $40).
- And an order of $200.00 only gets $20 off instead of $40 off!

## Requirements
1. Inspect \`promo.py\` and fix the \`SAVE20\` branch to correctly calculate **20% of the subtotal** (\`subtotal * 0.20\`).
2. Ensure that empty carts return \`0.0\`.
3. Support other existing codes (\`FLAT10\`, \`HALF\`).
4. Ensure final totals are rounded to 2 decimal places and cannot be negative.
5. Code must remain PEP8 compliant.`,
      "cart.py": `from promo import calculate_discount


def calculate_total(items: list[float], promo_code: str | None = None) -> float:
    """Calculates final order total after applying promotional discounts.

    Rounds to 2 decimal places and ensures total cannot be negative.
    """
    if not items:
        return 0.0

    subtotal = sum(items)
    discount = calculate_discount(subtotal, promo_code)
    final_total = max(0.0, subtotal - discount)
    return round(final_total, 2)
`,
      "promo.py": `def calculate_discount(subtotal: float, promo_code: str | None = None) -> float:
    """Calculates discount amount to subtract from the cart subtotal.

    Supported Codes:
    - SAVE20: 20% discount on subtotal
    - FLAT10: $10 flat discount (cannot exceed subtotal)
    - HALF: 50% discount on subtotal
    """
    if not promo_code:
        return 0.0

    code = promo_code.strip().upper()

    if code == "SAVE20":
        # BUG: Currently subtracts flat $20 instead of 20% of subtotal!
        # Customers purchasing a $500 cart only get $20 off instead of $100 off!
        return 20.0

    if code == "FLAT10":
        return min(10.0, subtotal)

    if code == "HALF":
        return round(subtotal * 0.5, 2)

    return 0.0
`,
      "models.py": `from dataclasses import dataclass


@dataclass
class CartItem:
    name: str
    price: float
    quantity: int = 1

    def total(self) -> float:
        return round(self.price * self.quantity, 2)
`
    }
  },
  {
    id: "02-jwt-token-expiration",
    title: "Fix JWT Expiration & Role Authorization",
    mode: "Security Audit",
    difficulty: "Medium",
    category: "Security & Auth",
    estimated_minutes: 15,
    tags: ["python", "auth", "jwt", "security", "middleware"],
    description: "Security audit discovered that verify_token fails to validate expiration timestamps, accepting expired sessions. Furthermore, require_role allows unauthorized role access. Fix token validation and RBAC checks.",
    files_count: 4,
    file_names: ["README.md", "auth.py", "middleware.py", "models.py"],
    hints: [
      "In auth.py: check payload['exp'] against current_time. If current_time >= payload['exp'], return None.",
      "In middleware.py: check_permission should verify user.role == required_role or allow 'superadmin'."
    ],
    files: {
      "README.md": `# Security Vulnerability Report: SEC-304

## Overview
During an internal penetration test, two security flaws were uncovered in the core authentication microservice:

1. **Acceptance of Expired Tokens**:
   In \`auth.py\`, \`verify_token\` decodes the token payload and validates the signature, but fails to check whether the token's expiration timestamp (\`exp\`) has elapsed. Even tokens issued years ago are treated as valid!

2. **Broken Role-Based Access Control (RBAC)**:
   In \`middleware.py\`, the \`require_role\` guard checks if the user has *any* role set instead of verifying that the user specifically possesses the \`required_role\`. A standard \`"viewer"\` user can access endpoints guarded by \`"admin"\`!

## Requirements
1. In \`auth.py\`:
   - In \`verify_token(token_str: str, current_time: float | None = None) -> TokenPayload | None\`:
     - If \`payload.exp <= now\`, token is expired. Return \`None\`.
     - If token format is invalid or decoding fails, return \`None\`.
2. In \`middleware.py\`:
   - Implement \`check_permission(user: User, required_role: str) -> bool\`:
     - Must return \`True\` if and only if \`user.role == required_role\` or user has \`"superadmin"\`.
     - Return \`False\` if user is \`None\` or role does not match.
3. Keep code clean and PEP8 compliant.`,
      "auth.py": `import base64
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
`,
      "middleware.py": `from models import User


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
`,
      "models.py": `from dataclasses import dataclass


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
`
    }
  },
  {
    id: "03-rate-limiter-sliding-window",
    title: "Implement Sliding Window Rate Limiter",
    mode: "Feature Addition",
    difficulty: "Medium",
    category: "Feature Addition",
    estimated_minutes: 20,
    tags: ["python", "infra", "algorithms", "rate-limiting", "concurrency"],
    description: "Our public API requires rate limiting to prevent abuse. Implement SlidingWindowLimiter in rate_limiter.py to track request timestamps within rolling windows and prune expired records.",
    files_count: 4,
    file_names: ["README.md", "config.py", "rate_limiter.py", "storage.py"],
    hints: [
      "Prune any timestamps where ts <= current_time - window_seconds.",
      "If remaining timestamps count < max_requests, append current_time and return True."
    ],
    files: {
      "README.md": `# Feature Request: Sliding Window Rate Limiter

## Problem
Our public API endpoints currently have no rate limiting. A single client can send hundreds of rapid-fire requests, exhausting our database connections.

Fixed-window limiters suffer from burst edge cases. We need a **Sliding Window Log** rate limiter.

## Requirements
In \`rate_limiter.py\`:
Implement \`SlidingWindowLimiter.is_allowed(client_id: str, current_time: float | None = None) -> bool\`:
1. Obtain the current unix timestamp (\`current_time\` if provided, else \`time.time()\`).
2. Retrieve the existing list of timestamps for \`client_id\` from \`self.store\`.
3. Evict all timestamps where \`ts <= current_time - self.window_seconds\`.
4. If the count of remaining timestamps is \`< self.max_requests\`:
   - Append \`current_time\` to the list.
   - Save the pruned list back to \`self.store\`.
   - Return \`True\` (request permitted).
5. Otherwise:
   - Save the pruned list back to \`self.store\` (so memory is still cleaned).
   - Return \`False\` (rate limit exceeded).`,
      "rate_limiter.py": `import time
from storage import InMemoryRateLimitStore


class SlidingWindowLimiter:

    def __init__(self, max_requests: int = 5, window_seconds: float = 60.0, store=None):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.store = store or InMemoryRateLimitStore()

    def is_allowed(self, client_id: str, current_time: float | None = None) -> bool:
        """Determines if a request from client_id is allowed under the sliding window.

        TODO: Implement sliding window logic:
        1. Determine current timestamp.
        2. Evict timestamps outside the sliding window (ts <= now - window_seconds).
        3. If count < max_requests, record timestamp and return True.
        4. Otherwise return False.
        """
        # STARTER CODE: Currently permits all requests without limiting!
        return True
`,
      "storage.py": `class InMemoryRateLimitStore:
    """Thread-safe in-memory store for client request timestamps."""

    def __init__(self):
        self._data: dict[str, list[float]] = {}

    def get_timestamps(self, key: str) -> list[float]:
        return list(self._data.get(key, []))

    def set_timestamps(self, key: str, timestamps: list[float]) -> None:
        self._data[key] = list(timestamps)

    def clear(self) -> None:
        self._data.clear()
`,
      "config.py": `from dataclasses import dataclass


@dataclass
class RateLimitConfig:
    max_requests: int = 5
    window_seconds: float = 60.0
`
    }
  },
  {
    id: "04-csv-memory-stream",
    title: "Fix Memory Spike in Large CSV Exporter",
    mode: "Refactoring",
    difficulty: "Hard",
    category: "Optimization",
    estimated_minutes: 25,
    tags: ["python", "performance", "generators", "streaming", "memory"],
    description: "Exporting large datasets crashes workers with Out-Of-Memory errors because the exporter accumulates all rows in an in-memory string list. Refactor exporter.py to stream CSV lines via a generator.",
    files_count: 4,
    file_names: ["README.md", "data_source.py", "exporter.py", "streamer.py"],
    hints: [
      "Use python's 'yield' to turn stream_csv_rows into a generator function.",
      "First yield the CSV header, then yield each formatted data row."
    ],
    files: {
      "README.md": `# Production Incident #4820: OOM on CSV Export

## Problem
When customers trigger an export for accounts with 100,000+ orders, worker nodes crash with Out-Of-Memory errors because \`export_to_csv_string\` buffers all lines in memory.

## Requirements
In \`exporter.py\`:
1. Implement \`stream_csv_rows(records_iterable) -> Generator[str, None, None]\`:
   - First yielded item must be the CSV header: \`"id,customer_id,amount,status"\`
   - Each subsequent item must be a formatted row: \`"{id},{customer_id},{amount:.2f},{status}"\`
2. Must be a true generator function using \`yield\` (not returning a list).`,
      "exporter.py": `from typing import Iterator
from data_source import OrderRecord


def stream_csv_rows(records: Iterator[OrderRecord]):
    """Memory-efficient streaming generator for CSV export.

    TODO:
    1. Yield the CSV header first: "id,customer_id,amount,status"
    2. Loop over records and yield each record as formatted string:
       f"{record.id},{record.customer_id},{record.amount:.2f},{record.status}"
    """
    # STARTER BUG: Accumulates all rows in a huge list instead of yielding!
    all_lines = ["id,customer_id,amount,status"]
    for r in records:
        all_lines.append(f"{r.id},{r.customer_id},{r.amount:.2f},{r.status}")

    # Returning a full list causes high memory spikes and fails generator checks!
    return all_lines
`,
      "data_source.py": `from dataclasses import dataclass
from typing import Iterator


@dataclass
class OrderRecord:
    id: int
    customer_id: str
    amount: float
    status: str


def mock_order_generator(total_count: int) -> Iterator[OrderRecord]:
    """Generates order records on the fly without loading all into memory."""
    for i in range(1, total_count + 1):
        yield OrderRecord(
            id=i,
            customer_id=f"cust_{i % 100}",
            amount=round(10.50 + (i % 50), 2),
            status="completed" if i % 2 == 0 else "pending",
        )
`,
      "streamer.py": `from typing import Iterable


class MockSink:
    """Mock file or network sink that records written chunk count."""

    def __init__(self):
        self.chunks: list[str] = []

    def write(self, data: str) -> None:
        self.chunks.append(data)


def write_stream_to_sink(stream: Iterable[str], sink: MockSink) -> int:
    """Writes items from a streaming generator directly to the sink.

    Returns the count of chunks written.
    """
    count = 0
    for line in stream:
        sink.write(line + "\\n")
        count += 1
    return count
`
    }
  },
  {
    id: "05-webhook-retry-dispatcher",
    title: "Add Exponential Backoff to Webhook Dispatcher",
    mode: "Feature Addition",
    difficulty: "Medium",
    category: "Feature Addition",
    estimated_minutes: 20,
    tags: ["python", "webhooks", "async", "retry", "backoff"],
    description: "Failing external webhook deliveries are currently retried immediately in an uncontrolled loop. Implement exponential backoff retry calculation and maximum retry threshold.",
    files_count: 4,
    file_names: ["README.md", "dispatcher.py", "events.py", "retry_policy.py"],
    hints: [
      "In retry_policy.py: delay = min(max_delay, base_delay * (multiplier ** attempt)).",
      "In dispatcher.py: if all attempts fail, update event.status = 'dead_letter'."
    ],
    files: {
      "README.md": `# Feature Spec: Webhook Exponential Backoff

## Problem
Our webhook delivery service retries failed deliveries with 0 second delay in an aggressive loop.

## Requirements
1. In \`retry_policy.py\`:
   - \`calculate_backoff_delay(attempt: int, base_delay: float = 1.0, multiplier: float = 2.0, max_delay: float = 60.0) -> float\`:
     - Formula: \`min(max_delay, base_delay * (multiplier ** attempt))\`
2. In \`dispatcher.py\`:
   - \`dispatch_with_retry(event, client, max_attempts=3)\`:
     - If client returns 200/204, set status to \`"delivered"\`.
     - Before each retry (attempt > 0), record backoff in \`event.delays_recorded\`.
     - If attempts exhausted, set status to \`"dead_letter"\`.`,
      "dispatcher.py": `from events import DispatchResult, WebhookEvent
from retry_policy import calculate_backoff_delay


class MockHttpClient:
    """Mock HTTP client that fails a given number of initial attempts."""

    def __init__(self, failures_before_success: int = 0):
        self.failures_remaining = failures_before_success
        self.calls_count = 0

    def post(self, url: str, payload: dict) -> int:
        self.calls_count += 1
        if self.failures_remaining > 0:
            self.failures_remaining -= 1
            return 503
        return 200


def dispatch_with_retry(
    event: WebhookEvent,
    client: MockHttpClient,
    max_attempts: int = 3,
) -> DispatchResult:
    # STARTER CODE:
    status_code = client.post(event.target_url, event.payload)
    if status_code in (200, 204):
        event.status = "delivered"
        return DispatchResult(True, "delivered", 1)

    event.status = "failed"
    return DispatchResult(False, "failed", 1)
`,
      "retry_policy.py": `def calculate_backoff_delay(
    attempt: int,
    base_delay: float = 1.0,
    multiplier: float = 2.0,
    max_delay: float = 60.0,
) -> float:
    """Calculates exponential backoff delay for a given retry attempt."""
    # STARTER BUG: Fixed 0 second delay causes immediate retry loop!
    return 0.0
`,
      "events.py": `from dataclasses import dataclass, field
from typing import Any


@dataclass
class WebhookEvent:
    id: str
    target_url: str
    payload: dict[str, Any]
    status: str = "pending"
    attempts_made: int = 0
    delays_recorded: list[float] = field(default_factory=list)


@dataclass
class DispatchResult:
    success: bool
    status: str
    attempts: int
`
    }
  },
  {
    id: "06-inventory-race-condition",
    title: "Prevent Inventory Allocation Race Condition",
    mode: "Bug Fix",
    difficulty: "Hard",
    category: "Bug Fixing",
    estimated_minutes: 25,
    tags: ["python", "database", "transactions", "e-commerce", "concurrency"],
    description: "Concurrent checkouts are creating negative inventory when stock is low. Implement atomic reservation and automatic rollback for multi-item orders in inventory_service.py.",
    files_count: 4,
    file_names: ["README.md", "inventory_service.py", "order.py", "warehouse.py"],
    hints: [
      "Check stock for all items BEFORE performing any deductions.",
      "If any item is missing or has insufficient stock, abort and do not modify the warehouse."
    ],
    files: {
      "README.md": `# High Priority Bug: Partial Reservation & Negative Inventory

## Incident Overview
If an order requests Item A (in stock) and Item B (out of stock), the system deducts Item A, then fails on Item B, leaving Item A deducted without fulfilling the order!

## Requirements
In \`inventory_service.py\`:
1. \`reserve_order_items(warehouse: Warehouse, items: dict[str, int]) -> bool\`:
   - All or Nothing: Either all items are reserved, or NONE are deducted.
   - If ANY item has \`stock < quantity_needed\`, return \`False\` without modifying any inventory.
   - If all items have sufficient stock, deduct all quantities and return \`True\`.
2. \`release_order_items(warehouse: Warehouse, items: dict[str, int]) -> None\`:
   - Restores the reserved quantities back to warehouse stock.`,
      "inventory_service.py": `from warehouse import Warehouse


def reserve_order_items(warehouse: Warehouse, items: dict[str, int]) -> bool:
    """Reserves inventory for all requested items atomically.

    Either ALL items are successfully reserved, or NO inventory is deducted.
    Returns True if reservation succeeded, False otherwise.
    """
    # BUGGY STARTER: Deducts items naively one-by-one without pre-checking or rolling back!
    for sku, qty in items.items():
        if qty <= 0:
            return False
        if warehouse.get_stock(sku) < qty:
            # Bug: Does not rollback earlier items!
            return False
        warehouse.deduct_stock(sku, qty)
    return True


def release_order_items(warehouse: Warehouse, items: dict[str, int]) -> None:
    """Restores reserved inventory back to warehouse."""
    for sku, qty in items.items():
        if qty > 0:
            warehouse.add_stock(sku, qty)
`,
      "warehouse.py": `class Warehouse:

    def __init__(self, initial_stock: dict[str, int] | None = None):
        self._stock: dict[str, int] = dict(initial_stock or {})

    def get_stock(self, sku: str) -> int:
        return self._stock.get(sku, 0)

    def set_stock(self, sku: str, quantity: int) -> None:
        self._stock[sku] = quantity

    def deduct_stock(self, sku: str, quantity: int) -> None:
        self._stock[sku] = self._stock.get(sku, 0) - quantity

    def add_stock(self, sku: str, quantity: int) -> None:
        self._stock[sku] = self._stock.get(sku, 0) + quantity

    def snapshot(self) -> dict[str, int]:
        return dict(self._stock)
`,
      "order.py": `from dataclasses import dataclass


@dataclass
class OrderRequest:
    order_id: str
    items: dict[str, int]  # sku -> quantity
`
    }
  }
];
