from dataclasses import dataclass


@dataclass
class OrderRequest:
    order_id: str
    items: dict[str, int]  # sku -> quantity
