import cmsGet from '../api/cmsClient';
import { monthOrder, parseEnrollmentFields } from '../utils/helpers';

async function fetchNationalData(options = {}) {
  const type = options.type || 'monthly';

  const queryParams = new URLSearchParams({
    'filter[BENE_GEO_LVL]': 'National',
    'sort[YEAR]': 'DESC',
    'sort[MONTH]': 'DESC',
    'size': '100',
    ...(type === 'yearly' && { 'filter[MONTH]': 'Year' }), // yearly rows come pre-aggregated by the API under MONTH: "Year"
  });

  const rawData = await cmsGet(queryParams);

  const parsedRows = rawData.map((row) => ({
    year: row.YEAR,
    month: row.MONTH,
    ...parseEnrollmentFields(row),
  }));

  if (type === 'yearly') {
    return parsedRows.sort((a, b) => b.year - a.year);
  }

  if (type === 'monthly') {
    return parsedRows
      .filter((row) => row.month !== 'Year')
      .sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return monthOrder[b.month] - monthOrder[a.month];
      })
      .slice(0, 12);
  }

  return parsedRows;
}

export default fetchNationalData;
