# Production Incident #4820: OOM on CSV Export

## Problem
When customers trigger an export for accounts with 100,000+ orders, Celery worker nodes are terminated by the Linux OOM Killer.

The culprit is `export_to_csv_string` in `exporter.py`:
It iterates through all records, formats them, builds a monolithic in-memory array of lines, and executes `"\n".join(all_lines)`. With large datasets, memory consumption spikes past 2GB!

## Goal
Refactor the export pipeline to use a **generator-based streaming architecture** that keeps memory bounded (`O(1)` memory usage).

## Requirements
In `exporter.py`:
1. Implement `stream_csv_rows(records_iterable) -> Generator[str, None, None]`:
   - First yielded item must be the CSV header: `"id,customer_id,amount,status"`
   - Each subsequent item must be a formatted row: `"{id},{customer_id},{amount:.2f},{status}"`
   - Handle commas in strings by escaping or wrapping in quotes if needed.
2. In `streamer.py`:
   - Implement `write_stream_to_sink(stream, sink)` which iterates over the stream generator and writes each chunk into `sink` without buffering the whole file in memory.
3. Code must adhere to PEP8 guidelines and maintain line length <= 100.
