from promo import calculate_discount


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
