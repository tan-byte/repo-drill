def calculate_backoff_delay(
    attempt: int,
    base_delay: float = 1.0,
    multiplier: float = 2.0,
    max_delay: float = 60.0,
) -> float:
    """Calculates exponential backoff delay for a given retry attempt.

    Formula: min(max_delay, base_delay * (multiplier ** attempt))
    """
    # STARTER BUG: Fixed 0 second delay causes immediate retry loop!
    return 0.0
