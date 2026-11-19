from typing import Iterable


class MockSink:
    """Mock file or network sink that records written chunk count."""

    def __init__(self):
        self.chunks: list[str] = []

    def write(self, data: str) -> None:
        self.chunks.append(data)


def write_stream_to_sink(stream: Iterable[str], sink: MockSink) -> int:
    """Writes items from a streaming generator directly to the sink.

    Returns the count of chunks written.
    """
    count = 0
    for line in stream:
        sink.write(line + "\n")
        count += 1
    return count
