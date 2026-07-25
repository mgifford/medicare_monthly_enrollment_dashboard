import cmsGet from '../api/cmsClient';
import { monthOrder, parseEnrollmentFields } from '../utils';

// All 50 states for a single period — used for the All Areas map and country-by-state table
export async function fetchAllStates(options = {}, { signal } = {}) {
  const year = options.year || '2024';
  const month = options.month || 'Year';

  const queryParams = new URLSearchParams({
    'filter[BENE_GEO_LVL]': 'State',
    'filter[YEAR]': year,
    'filter[MONTH]': month,
    size: '60',
  });

  const rawData = await cmsGet(queryParams, { signal });

  return rawData.map((row) => ({
    state: row.BENE_STATE_ABRVTN,
    stateName: row.BENE_STATE_DESC,
    year,
    month,
    ...parseEnrollmentFields(row),
  }));
}

// Trend data for a single state, fetches once and returns both slices
export async function fetchStateEnrollment(options = {}, { signal } = {}) {
  const { state } = options;

  if (!state) {
    throw new Error('fetchStateEnrollment requires options.state (e.g. \'NY\')');
  }

  const queryParams = new URLSearchParams({
    'filter[BENE_GEO_LVL]': 'State',
    'filter[BENE_STATE_ABRVTN]': state,
    'sort[YEAR]': 'DESC',
    'sort[MONTH]': 'DESC',
    size: '100',
  });

  const rawData = await cmsGet(queryParams, { signal });

  const parsedRows = rawData.map((row) => ({
    state: row.BENE_STATE_ABRVTN,
    stateName: row.BENE_STATE_DESC,
    year: row.YEAR,
    month: row.MONTH,
    ...parseEnrollmentFields(row),
  }));

  const yearly = parsedRows
    .filter((row) => row.month === 'Year')
    .sort((a, b) => b.year - a.year);

  const monthly = parsedRows
    .filter((row) => row.month !== 'Year')
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return monthOrder[b.month] - monthOrder[a.month];
    })
    .slice(0, 12);

  return { yearly, monthly };
}
