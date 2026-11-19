def calculate_discount(subtotal: float, promo_code: str | None = None) -> float:
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
