from typing import Iterator
from data_source import OrderRecord


def stream_csv_rows(records: Iterator[OrderRecord]):
    """Memory-efficient streaming generator for CSV export.

    TODO:
    1. Yield the CSV header first: "id,customer_id,amount,status"
    2. Loop over records and yield each record as formatted string:
       f"{record.id},{record.customer_id},{record.amount:.2f},{record.status}"
    """
    # STARTER BUG: Accumulates all rows in a huge list instead of yielding!
    all_lines = ["id,customer_id,amount,status"]
    for r in records:
        all_lines.append(f"{r.id},{r.customer_id},{r.amount:.2f},{r.status}")

    # Returning a full list causes high memory spikes and fails generator checks!
    return all_lines
