/**
 * Lightweight In-Memory TTL Cache Utility for WeatherGPT
 * Caches API responses and computed values with automatic expiration
 * to minimize latency (<5ms) and prevent external rate-limit throttling.
 */

class MemoryCache {
  constructor(defaultTtlSeconds = 600) {
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds;
    this.hits = 0;
    this.misses = 0;

    // Periodic garbage collection every 5 minutes
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref(); // Don't block process exit
    }
  }

  /**
   * Set a key-value pair with TTL in seconds
   */
  set(key, value, ttlSeconds = this.defaultTtl) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
    return value;
  }

  /**
   * Get a cached value by key
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Delete a key
   */
  del(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Return cache performance stats
   */
  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: (this.hits + this.misses) > 0 ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1) + '%' : '0%'
    };
  }
}

module.exports = new MemoryCache();
