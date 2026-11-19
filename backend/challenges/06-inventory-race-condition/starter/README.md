# High Priority Bug: Partial Reservation & Negative Inventory

## Incident Overview
During flash sale events, orders containing multiple items frequently encounter partial inventory allocation:
If an order requests Item A (in stock) and Item B (out of stock), the system deducts Item A, then throws an error on Item B, leaving Item A deducted without creating an order!

Furthermore, insufficient stock checks allow item stock to drop below zero (e.g. -2 items in warehouse).

## Requirements
In `inventory_service.py`:
Implement atomic order reservation:
1. `reserve_order_items(warehouse: Warehouse, items: dict[str, int]) -> bool`:
   - `items` maps `item_sku -> quantity_needed`.
   - All quantities must be `> 0`.
   - **All or Nothing**: Either all items are successfully reserved, or NONE are deducted.
   - If ANY item has `stock < quantity_needed`, no item in the warehouse may be decremented. Return `False`.
   - If all items have sufficient stock, deduct all required quantities from `warehouse` and return `True`.
2. `release_order_items(warehouse: Warehouse, items: dict[str, int]) -> None`:
   - Restores the reserved quantities back to warehouse stock.
3. Code must be clean and PEP8 compliant.
