class Warehouse:

    def __init__(self, initial_stock: dict[str, int] | None = None):
        self._stock: dict[str, int] = dict(initial_stock or {})

    def get_stock(self, sku: str) -> int:
        return self._stock.get(sku, 0)

    def set_stock(self, sku: str, quantity: int) -> None:
        self._stock[sku] = quantity

    def deduct_stock(self, sku: str, quantity: int) -> None:
        self._stock[sku] = self._stock.get(sku, 0) - quantity

    def add_stock(self, sku: str, quantity: int) -> None:
        self._stock[sku] = self._stock.get(sku, 0) + quantity

    def snapshot(self) -> dict[str, int]:
        return dict(self._stock)
