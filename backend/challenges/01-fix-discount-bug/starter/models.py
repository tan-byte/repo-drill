from dataclasses import dataclass


@dataclass
class CartItem:
    name: str
    price: float
    quantity: int = 1

    def total(self) -> float:
        return round(self.price * self.quantity, 2)
