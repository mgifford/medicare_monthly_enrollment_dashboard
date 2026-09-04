/** @jest-environment jsdom */

import ParquetDataSource, { ParquetSourceUnavailableError } from './ParquetDataSource';

describe('ParquetDataSource (Phase 3 stub)', () => {
  test('has the expected sourceName', () => {
    expect(ParquetDataSource.sourceName).toBe('parquet');
  });

  test('initialize always throws ParquetSourceUnavailableError', async () => {
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
});
