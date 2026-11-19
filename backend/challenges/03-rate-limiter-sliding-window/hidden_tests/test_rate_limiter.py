from rate_limiter import SlidingWindowLimiter


def test_allows_under_limit():
    limiter = SlidingWindowLimiter(max_requests=3, window_seconds=60.0)
    assert limiter.is_allowed("client-1", current_time=100.0) is True
    assert limiter.is_allowed("client-1", current_time=110.0) is True
    assert limiter.is_allowed("client-1", current_time=120.0) is True


def test_blocks_exceeding_requests():
    limiter = SlidingWindowLimiter(max_requests=2, window_seconds=60.0)
    assert limiter.is_allowed("client-a", current_time=10.0) is True
    assert limiter.is_allowed("client-a", current_time=20.0) is True
    # 3rd request inside the 60s window should be rejected
    assert limiter.is_allowed("client-a", current_time=30.0) is False


def test_allows_after_window_expires():
    limiter = SlidingWindowLimiter(max_requests=2, window_seconds=60.0)
    assert limiter.is_allowed("client-b", current_time=10.0) is True
    assert limiter.is_allowed("client-b", current_time=20.0) is True
    assert limiter.is_allowed("client-b", current_time=30.0) is False

    # After timestamp 10.0 rolls out of the 60s window (at t=75.0, 10.0 is <= 75 - 60 = 15)
    assert limiter.is_allowed("client-b", current_time=75.0) is True


def test_isolated_clients():
    limiter = SlidingWindowLimiter(max_requests=1, window_seconds=60.0)
    assert limiter.is_allowed("client-x", current_time=1.0) is True
    assert limiter.is_allowed("client-x", current_time=2.0) is False
    # client-y should have its own separate quota
    assert limiter.is_allowed("client-y", current_time=2.0) is True
