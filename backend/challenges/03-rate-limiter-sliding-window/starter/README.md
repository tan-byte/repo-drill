# Feature Request: Sliding Window Rate Limiter

## Problem
Our public API endpoints currently have no rate limiting. A single client can send hundreds of rapid-fire requests, exhausting our database connections.

Fixed-window limiters suffer from burst edge cases (e.g. allowing 2x limit at window boundaries). We need a **Sliding Window Log** rate limiter.

## Architecture
- `config.py`: Default configurations (`max_requests=5`, `window_seconds=60.0`).
- `storage.py`: `InMemoryRateLimitStore` providing `get_timestamps(key)` and `set_timestamps(key, list)`.
- `rate_limiter.py`: The `SlidingWindowLimiter` class to complete.

## Requirements
In `rate_limiter.py`:
Implement `SlidingWindowLimiter.is_allowed(client_id: str, current_time: float | None = None) -> bool`:
1. Obtain the current unix timestamp (`current_time` if provided, else `time.time()`).
2. Retrieve the existing list of timestamps for `client_id` from `self.store`.
3. Evict all timestamps where `ts <= current_time - self.window_seconds`.
4. If the count of remaining timestamps is `< self.max_requests`:
   - Append `current_time` to the list.
   - Save the pruned list back to `self.store`.
   - Return `True` (request permitted).
5. Otherwise:
   - Save the pruned list back to `self.store` (so memory is still cleaned).
   - Return `False` (rate limit exceeded).
