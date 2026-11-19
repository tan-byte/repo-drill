# Feature Spec: Webhook Exponential Backoff

## Problem
Our webhook delivery service notifies customers when payment events occur. If a customer endpoint is experiencing downtime or rate-limiting (e.g. HTTP 429 / 503), the current dispatcher retries every 0 seconds in an aggressive loop!

This overwhelms customer servers and burns through our worker threads.

## Requirements
1. In `retry_policy.py`:
   - Implement `calculate_backoff_delay(attempt: int, base_delay: float = 1.0, multiplier: float = 2.0, max_delay: float = 60.0) -> float`:
     - Formula: `min(max_delay, base_delay * (multiplier ** attempt))`
     - `attempt` is 0-indexed: attempt 0 -> `1.0s`, attempt 1 -> `2.0s`, attempt 2 -> `4.0s`, attempt 3 -> `8.0s`.
     - Returned delay must never exceed `max_delay`.
2. In `dispatcher.py`:
   - Implement `dispatch_with_retry(event: WebhookEvent, client: MockHttpClient, max_attempts: int = 3) -> DispatchResult`:
     - Try sending up to `max_attempts` times.
     - If client returns `200` or `204`, mark status as `"delivered"` and return.
     - If all `max_attempts` fail, mark status as `"dead_letter"`, record total retries, and return failure.
3. Code must be clean and PEP8 compliant.
