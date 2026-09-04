/**
 * Data source that queries preprocessed Parquet files with DuckDB-Wasm.
 *
 * This opt-in implementation currently supports national enrollment only.
 * Unsupported services throw so DataManager can use CmsApiDataSource.
 *
 * See docs/adr/0001-parquet-duckdb-webmcp-architecture.md for the design.
 */

/* eslint-disable max-classes-per-file */

import DuckDbClient from '../duckdb/DuckDbClient';
import { selectDuckDbBundle } from '../duckdb/bundleSelector';
import ParquetCache from '../ParquetCache';
import { parseEnrollmentFields, sortDescByPeriod } from '../../utils';

const SUMMARY_FILE_NAME = 'national-summary.parquet';

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

  constructor({
    manifestUrl = 'data/v1/manifest.json',
    assetBaseUrl = 'assets/duckdb',
    client = null,
    fetchFn = globalThis.fetch,
    storage = globalThis.localStorage,
    cache = null,
  } = {}) {
    this.manifestUrl = manifestUrl;
    this.assetBaseUrl = assetBaseUrl;
    this.client = client;
    this.fetchFn = fetchFn;
    this.storage = storage;
    this.cache = cache || new ParquetCache({ fetchFn });
    this.manifest = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    if (!this.isOptedIn()) {
      throw new ParquetSourceUnavailableError(
        "Parquet data is disabled; set localStorage['use-parquet'] to '1' to opt in.",
      );
    }
    try {
      this.manifest = await this.cache.loadManifest(this.manifestUrl);
    } catch {
      throw new ParquetSourceUnavailableError('Unable to load the Parquet data manifest.');
    }
    if (!this.manifest?.files?.summary?.path) {
      throw new ParquetSourceUnavailableError('The Parquet data manifest has no summary file.');
    }

    this.client ||= new DuckDbClient({
      bundle: selectDuckDbBundle({ assetBaseUrl: this.assetBaseUrl }),
    });
    await this.client.initialize();
    try {
      const summaryBytes = await this.cache.loadFile(this.summaryUrl(), this.manifest);
      await this.client.registerFileBuffer(SUMMARY_FILE_NAME, summaryBytes);
    } catch {
      throw new ParquetSourceUnavailableError('Unable to load the Parquet national summary.');
    }
    this.initialized = true;
  }

  async fetch(serviceName, options = {}) {
    if (!this.initialized) {
      throw new ParquetSourceUnavailableError(
        'ParquetDataSource.fetch called before initialization.',
      );
    }
    if (serviceName !== 'nationalEnrollment') {
      throw new ParquetSourceUnavailableError(
        `ParquetDataSource does not support '${serviceName}'.`,
      );
    }

    const rows = await this.client.query(
      `SELECT year, month, TOT_BENES, ORGNL_MDCR_BENES, MA_AND_OTH_BENES, PRSCRPTN_DRUG_TOT_BENES, PRSCRPTN_DRUG_PDP_BENES, PRSCRPTN_DRUG_MAPD_BENES FROM read_parquet('${SUMMARY_FILE_NAME}') WHERE geo_level = 'National' ORDER BY CAST(year AS INTEGER) DESC, month_ordinal DESC`,
    );
    const parsedRows = rows.map((row) => ({
      year: String(row.year),
      month: row.month,
      ...parseEnrollmentFields(row),
    }));

    if (options.type === 'yearly')
      return sortDescByPeriod(parsedRows.filter((row) => row.month === 'Year'));
    if (!options.type || options.type === 'monthly') {
      return sortDescByPeriod(parsedRows.filter((row) => row.month !== 'Year')).slice(0, 12);
    }
    return parsedRows;
  }

  isOptedIn() {
    try {
      return this.storage?.['use-parquet'] === '1';
    } catch {
      return false;
    }
  }

  summaryUrl() {
    return `data/${this.manifest.files.summary.path}`;
  }

  getMetadata() {
    return {
      source: ParquetDataSource.sourceName,
      datasetVersion: this.manifest?.schema_version || null,
      freshness: this.manifest?.generated_at || null,
    };
  }
}
