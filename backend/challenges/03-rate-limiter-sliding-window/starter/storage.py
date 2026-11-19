class InMemoryRateLimitStore:
    """Thread-safe in-memory store for client request timestamps."""

    def __init__(self):
        self._data: dict[str, list[float]] = {}

    def get_timestamps(self, key: str) -> list[float]:
        return list(self._data.get(key, []))

    def set_timestamps(self, key: str, timestamps: list[float]) -> None:
        self._data[key] = list(timestamps)

    def clear(self) -> None:
        self._data.clear()
