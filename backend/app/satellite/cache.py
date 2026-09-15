import time
from typing import Dict, Any, Optional
from threading import Lock

class SatelliteAnalysisCache:
    """Thread-safe LRU/TTL cache for satellite analysis payloads."""
    def __init__(self, ttl_seconds: int = 3600):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._timestamps: Dict[str, float] = {}
        self._ttl = ttl_seconds
        self._lock = Lock()

    def _make_key(self, project_id: str, radius: float, provider: str) -> str:
        return f"{project_id.upper()}:{radius}:{provider}"

    def get(self, project_id: str, radius: float = 100.0, provider: str = "Bhuvan") -> Optional[Dict[str, Any]]:
        key = self._make_key(project_id, radius, provider)
        with self._lock:
            if key in self._cache:
                timestamp = self._timestamps.get(key, 0)
                if time.time() - timestamp < self._ttl:
                    return self._cache[key]
                else:
                    del self._cache[key]
                    if key in self._timestamps:
                        del self._timestamps[key]
        return None

    def set(self, project_id: str, data: Dict[str, Any], radius: float = 100.0, provider: str = "Bhuvan"):
        key = self._make_key(project_id, radius, provider)
        with self._lock:
            self._cache[key] = data
            self._timestamps[key] = time.time()

satellite_cache = SatelliteAnalysisCache()
