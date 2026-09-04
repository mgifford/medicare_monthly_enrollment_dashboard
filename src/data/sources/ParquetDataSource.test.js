/** @jest-environment jsdom */

import ParquetDataSource, { ParquetSourceUnavailableError } from './ParquetDataSource';

describe('ParquetDataSource', () => {
  test('has the expected sourceName', () => {
    expect(ParquetDataSource.sourceName).toBe('parquet');
  });

  test('initialize requires explicit localStorage opt-in', async () => {
    const source = new ParquetDataSource();
    await expect(source.initialize()).rejects.toBeInstanceOf(ParquetSourceUnavailableError);
  });

  test('fetch throws ParquetSourceUnavailableError before initialization succeeds', async () => {
    const source = new ParquetDataSource();
    await expect(source.fetch('nationalEnrollment', {})).rejects.toBeInstanceOf(
      ParquetSourceUnavailableError,
    );
  });

  test('metadata reflects an uninitialized source', () => {
    const source = new ParquetDataSource();
    expect(source.getMetadata()).toEqual({
      source: 'parquet',
      datasetVersion: null,
      freshness: null,
    });
  });

  test('returns national data with the CMS API output shape', async () => {
    const client = {
      initialize: jest.fn(async () => {}),
      registerFileBuffer: jest.fn(async () => {}),
      query: jest.fn(async () => [
        {
          year: '2024',
          month: 'January',
          TOT_BENES: 100,
          ORGNL_MDCR_BENES: 60,
          MA_AND_OTH_BENES: 40,
          PRSCRPTN_DRUG_TOT_BENES: 90,
          PRSCRPTN_DRUG_PDP_BENES: 50,
          PRSCRPTN_DRUG_MAPD_BENES: 40,
        },
      ]),
    };
    const source = new ParquetDataSource({
      client,
      storage: { 'use-parquet': '1' },
      cache: {
        loadManifest: jest.fn(async () => ({ files: { summary: { path: 'v1/summary.parquet' } } })),
        loadFile: jest.fn(async () => new ArrayBuffer(1)),
      },
    });

    await source.initialize();
    await expect(source.fetch('nationalEnrollment', { type: 'monthly' })).resolves.toEqual([
      {
        year: '2024',
        month: 'January',
        totalEnrollees: 100,
        omCount: 60,
        maCount: 40,
        omPercent: 60,
        maPercent: 40,
        drugTotal: 90,
        pdpCount: 50,
        mapdCount: 40,
        pdpPercent: 55.56,
        mapdPercent: 44.44,
      },
    ]);
    expect(client.registerFileBuffer).toHaveBeenCalledWith(
      'national-summary.parquet',
      expect.any(ArrayBuffer),
    );
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining("read_parquet('national-summary.parquet')"),
    );
  });

  test('rejects unsupported services after initialization', async () => {
    const source = new ParquetDataSource({
      client: { initialize: jest.fn(async () => {}), registerFileBuffer: jest.fn(async () => {}) },
      storage: { 'use-parquet': '1' },
      cache: {
        loadManifest: jest.fn(async () => ({ files: { summary: { path: 'v1/summary.parquet' } } })),
        loadFile: jest.fn(async () => new ArrayBuffer(1)),
      },
    });

    await source.initialize();
    await expect(source.fetch('allStates')).rejects.toBeInstanceOf(ParquetSourceUnavailableError);
  });
});
