from dataclasses import dataclass
from typing import Iterator


@dataclass
class OrderRecord:
    id: int
    customer_id: str
    amount: float
    status: str


def mock_order_generator(total_count: int) -> Iterator[OrderRecord]:
    """Generates order records on the fly without loading all into memory."""
    for i in range(1, total_count + 1):
        yield OrderRecord(
            id=i,
            customer_id=f"cust_{i % 100}",
            amount=round(10.50 + (i % 50), 2),
            status="completed" if i % 2 == 0 else "pending",
        )
