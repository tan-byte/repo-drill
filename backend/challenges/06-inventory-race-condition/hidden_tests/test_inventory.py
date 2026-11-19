from inventory_service import release_order_items, reserve_order_items
from warehouse import Warehouse


def test_successful_reservation():
    wh = Warehouse({"LAPTOP": 5, "MOUSE": 10})
    success = reserve_order_items(wh, {"LAPTOP": 2, "MOUSE": 3})

    assert success is True
    assert wh.get_stock("LAPTOP") == 3
    assert wh.get_stock("MOUSE") == 7


def test_atomic_rollback_on_partial_failure():
    # LAPTOP has stock 5, but MONITOR has stock 0
    wh = Warehouse({"LAPTOP": 5, "MONITOR": 0})
    success = reserve_order_items(wh, {"LAPTOP": 2, "MONITOR": 1})

    assert success is False
    # LAPTOP must NOT be deducted if MONITOR failed!
    assert wh.get_stock("LAPTOP") == 5, "Warehouse LAPTOP stock was deducted despite order failure!"
    assert wh.get_stock("MONITOR") == 0


def test_zero_or_negative_order_quantity():
    wh = Warehouse({"ITEM_A": 10})
    assert reserve_order_items(wh, {"ITEM_A": 0}) is False
    assert reserve_order_items(wh, {"ITEM_A": -1}) is False
    assert wh.get_stock("ITEM_A") == 10


def test_release_inventory():
    wh = Warehouse({"KEYBOARD": 5})
    release_order_items(wh, {"KEYBOARD": 3})
    assert wh.get_stock("KEYBOARD") == 8
