import time
from typing import Dict, Any, Optional
import threading

class SimpleCache:
    """Thread-safe in-memory cache with TTL."""
    def __init__(self, ttl_seconds: int = 300):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._ttl = ttl_seconds
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._cache:
                return None
            
            entry = self._cache[key]
            if time.time() - entry["timestamp"] > self._ttl:
                del self._cache[key]
                return None
            
            return entry["data"]

    def set(self, key: str, data: Any):
        with self._lock:
            self._cache[key] = {
                "data": data,
                "timestamp": time.time()
            }

# Global shareable cache instance
analysis_cache = SimpleCache(ttl_seconds=600)  # 10 minutes cache
