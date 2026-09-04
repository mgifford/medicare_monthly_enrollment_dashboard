/**
 * Data source that queries preprocessed Parquet files with DuckDB-Wasm.
 *
 * Phase 3 ships this as a stub: initialize() always throws, so the
 * DataManager will always fall back to CmsApiDataSource. Phase 4 replaces
 * the stub with a real Worker-hosted DuckDB-Wasm implementation.
 *
 * See docs/adr/0001-parquet-duckdb-webmcp-architecture.md for the design.
 */

/* eslint-disable max-classes-per-file, class-methods-use-this */

export class ParquetSourceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParquetSourceUnavailableError';
  }
}

export default class ParquetDataSource {
  static get sourceName() {
    return 'parquet';
  }

  constructor({ manifestUrl = 'data/v1/manifest.json' } = {}) {
    this.manifestUrl = manifestUrl;
    this.manifest = null;
    this.initialized = false;
  }

  async initialize() {
    throw new ParquetSourceUnavailableError(
      'ParquetDataSource is not yet implemented (Phase 4). ' +
        'DataManager should treat this as a signal to use the CMS API fallback.',
    );
  }

  async fetch() {
    throw new ParquetSourceUnavailableError(
      'ParquetDataSource.fetch called before Phase 4 initialization succeeded.',
    );
  }

  getMetadata() {
    return {
      source: ParquetDataSource.sourceName,
      datasetVersion: this.manifest?.schema_version || null,
      freshness: this.manifest?.generated_at || null,
    };
  }
}
