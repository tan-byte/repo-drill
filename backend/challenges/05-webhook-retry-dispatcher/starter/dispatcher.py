from events import DispatchResult, WebhookEvent
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
    """Dispatches a webhook event with exponential backoff retry.

    TODO:
    1. Loop through attempts from 0 to max_attempts - 1.
    2. Before each retry (attempt > 0), calculate backoff delay and record it in
       event.delays_recorded.
    3. Make client.post call. If status in [200, 204], set event.status = "delivered"
       and return DispatchResult(True, "delivered", attempts).
    4. If all attempts exhausted, set event.status = "dead_letter"
       and return DispatchResult(False, "dead_letter", max_attempts).
    """
    # STARTER CODE:
    status_code = client.post(event.target_url, event.payload)
    if status_code in (200, 204):
        event.status = "delivered"
        return DispatchResult(True, "delivered", 1)

    event.status = "failed"
    return DispatchResult(False, "failed", 1)
