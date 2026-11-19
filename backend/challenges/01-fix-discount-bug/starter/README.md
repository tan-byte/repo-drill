# Incident #1042: Shopping Cart Discount Bug

## Problem Description
Multiple customer support tickets report that applying the promo code `SAVE20` subtracts a flat **\$20.00** instead of applying the promised **20% percentage discount**.

For example:
- A cart with \$100.00 subtotal gets \$20 off (resulting in \$80), which happens to look right.
- But a cart with \$50.00 subtotal currently gets \$20 off (total \$30) instead of \$10 off (expected total \$40).
- And an order of \$200.00 only gets \$20 off instead of \$40 off!

## Requirements
1. Inspect `promo.py` and fix the `SAVE20` branch to correctly calculate **20% of the subtotal** (`subtotal * 0.20`).
2. Ensure that empty carts return `0.0`.
3. Support other existing codes (`FLAT10`, `HALF`).
4. Ensure final totals are rounded to 2 decimal places and cannot be negative.
5. Code must remain PEP8 compliant.
