from dispatcher import MockHttpClient, dispatch_with_retry
from events import WebhookEvent
from retry_policy import calculate_backoff_delay


def test_backoff_calculation():
    # attempt 0 -> 1.0 * (2^0) = 1.0
    assert calculate_backoff_delay(0) == 1.0
    # attempt 1 -> 1.0 * (2^1) = 2.0
    assert calculate_backoff_delay(1) == 2.0
    # attempt 2 -> 1.0 * (2^2) = 4.0
    assert calculate_backoff_delay(2) == 4.0
    # attempt 3 -> 1.0 * (2^3) = 8.0
    assert calculate_backoff_delay(3) == 8.0
    # Cap at max_delay
    assert calculate_backoff_delay(10, max_delay=30.0) == 30.0


def test_first_attempt_success():
    client = MockHttpClient(failures_before_success=0)
    event = WebhookEvent(id="ev_1", target_url="https://api.test/hook", payload={"k": "v"})
    res = dispatch_with_retry(event, client, max_attempts=3)

    assert res.success is True
    assert res.status == "delivered"
    assert event.status == "delivered"
    assert client.calls_count == 1
    assert len(event.delays_recorded) == 0


def test_retry_success_after_failure():
    # Fails 2 times, then succeeds on 3rd attempt
    client = MockHttpClient(failures_before_success=2)
    event = WebhookEvent(id="ev_2", target_url="https://api.test/hook", payload={"k": "v"})
    res = dispatch_with_retry(event, client, max_attempts=4)

    assert res.success is True
    assert res.status == "delivered"
    assert client.calls_count == 3
    assert len(event.delays_recorded) == 2
    assert event.delays_recorded[0] == 1.0  # delay before retry 1
    assert event.delays_recorded[1] == 2.0  # delay before retry 2


def test_dead_letter_on_exhausted_retries():
    # Fails all attempts
    client = MockHttpClient(failures_before_success=10)
    event = WebhookEvent(id="ev_3", target_url="https://api.test/hook", payload={"k": "v"})
    res = dispatch_with_retry(event, client, max_attempts=3)

    assert res.success is False
    assert res.status == "dead_letter"
    assert event.status == "dead_letter"
    assert client.calls_count == 3
