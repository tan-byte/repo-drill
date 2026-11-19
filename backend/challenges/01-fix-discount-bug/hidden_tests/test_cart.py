from cart import calculate_total
from promo import calculate_discount


def test_empty_cart():
    assert calculate_total([]) == 0.0


def test_no_promo():
    assert calculate_total([50.0, 50.0]) == 100.0
    assert calculate_total([12.50, 7.49, 10.01]) == 30.0


def test_save20_percentage():
    # 20% of 100 is 20 -> 80
    assert calculate_total([50.0, 50.0], "SAVE20") == 80.0
    # 20% of 50 is 10 -> 40 (Before bug fix, it returned 30.0)
    assert calculate_total([25.0, 25.0], "SAVE20") == 40.0
    # 20% of 200 is 40 -> 160
    assert calculate_total([200.0], "SAVE20") == 160.0


def test_flat10_promo():
    assert calculate_total([100.0], "FLAT10") == 90.0
    # Cannot exceed subtotal
    assert calculate_total([5.0], "FLAT10") == 0.0


def test_half_promo():
    assert calculate_total([75.0, 25.0], "HALF") == 50.0


def test_invalid_promo():
    assert calculate_total([45.0], "NONEXISTENT") == 45.0
