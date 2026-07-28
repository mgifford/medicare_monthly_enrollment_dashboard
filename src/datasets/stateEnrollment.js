import cmsGet from '../api/cmsClient';
import { parseEnrollmentFields, sortDescByPeriod } from '../utils';

export async function fetchAllStates(options = {}, { signal } = {}) {
  const { year, month } = options;

  if (!year || !month) {
    throw new Error('fetchAllStates requires options.year and options.month');
  }

  const queryParams = new URLSearchParams({
    'filter[BENE_GEO_LVL]': 'State',
    'filter[YEAR]': year,
    'filter[MONTH]': month,
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
  });

  const rawData = await cmsGet(queryParams, { signal });

  const parsedRows = rawData.map((row) => ({
    state: row.BENE_STATE_ABRVTN,
    stateName: row.BENE_STATE_DESC,
    year: row.YEAR,
    month: row.MONTH,
    ...parseEnrollmentFields(row),
  }));

  const yearly = sortDescByPeriod(parsedRows.filter((row) => row.month === 'Year'));
  const monthly = sortDescByPeriod(parsedRows.filter((row) => row.month !== 'Year')).slice(0, 12);

  return { yearly, monthly };
}
