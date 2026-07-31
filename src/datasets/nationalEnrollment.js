import cmsGet from '../api/cmsClient';
import { parseEnrollmentFields, sortDescByPeriod } from '../utils';

async function fetchNationalData(options = {}, { signal } = {}) {
  const type = options.type || 'monthly';

  // yearly rows come pre-aggregated by the API under MONTH: "Year"
  const queryParams = new URLSearchParams({
    'filter[BENE_GEO_LVL]': 'National',
    'sort[YEAR]': 'DESC',
    'sort[MONTH]': 'DESC',
    size: '100',
    ...(type === 'yearly' && { 'filter[MONTH]': 'Year' }),
  });

  const rawData = await cmsGet(queryParams, { signal });

  const parsedRows = rawData.map((row) => ({
    year: row.YEAR,
    month: row.MONTH,
    ...parseEnrollmentFields(row),
  }));

  if (type === 'yearly') {
    return sortDescByPeriod(parsedRows);
  }

  if (type === 'monthly') {
    return sortDescByPeriod(parsedRows.filter((row) => row.month !== 'Year')).slice(0, 12);
  }

  return parsedRows;
}

export default fetchNationalData;
