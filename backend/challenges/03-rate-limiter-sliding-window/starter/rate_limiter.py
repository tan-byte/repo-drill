import time
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
