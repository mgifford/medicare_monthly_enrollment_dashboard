const CACHE_PREFIX = 'medicare-enrollment-parquet';

export default class ParquetCache {
  constructor({
    cacheStorage = globalThis.caches,
    storageManager = globalThis.navigator?.storage,
    fetchFn = globalThis.fetch,
  } = {}) {
    this.cacheStorage = cacheStorage;
    this.storageManager = storageManager;
    this.fetchFn = fetchFn;
  }

  async loadManifest(url) {
    const cache = await this.openCache(`${CACHE_PREFIX}-manifest`);
    try {
      const response = await this.fetchFn(url);
      if (!response.ok) throw new Error(`Manifest request failed with ${response.status}.`);
      if (cache && (await this.hasCapacity(0))) await cache.put(url, response.clone());
      return response.json();
    } catch (error) {
      const cached = cache && (await cache.match(url));
      if (cached) return cached.json();
      throw error;
    }
  }

  async loadFile(url, manifest) {
    const cacheName = ParquetCache.cacheName(manifest);
    const cache = await this.openCache(cacheName);
    const cached = cache && (await cache.match(url));
    if (cached) return cached.arrayBuffer();

    const response = await this.fetchFn(url);
    if (!response.ok) throw new Error(`Parquet request failed with ${response.status}.`);
    const cacheableResponse = response.clone();
    const buffer = await response.arrayBuffer();
    if (cache && (await this.hasCapacity(manifest.files.summary.size_bytes))) {
      await cache.put(url, cacheableResponse);
      await this.removeObsoleteCaches(cacheName);
    }
    return buffer;
  }

  static cacheName(manifest) {
    const { schema_version: schemaVersion, files } = manifest;
    return `${CACHE_PREFIX}-${schemaVersion}-${files.summary.sha256}`;
  }

  async openCache(name) {
    try {
      return this.cacheStorage ? await this.cacheStorage.open(name) : null;
    } catch {
      return null;
    }
  }

  async hasCapacity(requiredBytes) {
    try {
      const estimate = await this.storageManager?.estimate();
      return Boolean(estimate && estimate.quota - estimate.usage >= requiredBytes);
    } catch {
      return false;
    }
  }

  async removeObsoleteCaches(activeCacheName) {
    try {
      const cacheNames = await this.cacheStorage.keys();
      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith(`${CACHE_PREFIX}-`) &&
              name !== activeCacheName &&
              name !== `${CACHE_PREFIX}-manifest`,
          )
          .map((name) => this.cacheStorage.delete(name)),
      );
    } catch {
      // Cache cleanup is best-effort.
    }
  }
}
