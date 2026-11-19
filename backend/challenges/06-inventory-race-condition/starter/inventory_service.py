from warehouse import Warehouse


def reserve_order_items(warehouse: Warehouse, items: dict[str, int]) -> bool:
    """Reserves inventory for all requested items atomically.

    Either ALL items are successfully reserved, or NO inventory is deducted.
    Returns True if reservation succeeded, False otherwise.
    """
    # BUGGY STARTER IMPLEMENTATION:
    # Deducts items naively one-by-one without pre-checking or rolling back!
    # If the second item is out of stock, the first item remains deducted!
    for sku, qty in items.items():
        if qty <= 0:
            return False
        if warehouse.get_stock(sku) < qty:
            # Bug: Does not rollback earlier items!
            return False
        warehouse.deduct_stock(sku, qty)
    return True


def release_order_items(warehouse: Warehouse, items: dict[str, int]) -> None:
    """Restores reserved inventory back to warehouse."""
    for sku, qty in items.items():
        if qty > 0:
            warehouse.add_stock(sku, qty)
