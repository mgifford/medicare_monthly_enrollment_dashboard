import cmsGet from '../api/cmsClient';
import { monthOrder, parseEnrollmentFields } from '../utils';

const COUNTY_COLUMNS = [
  'BENE_STATE_ABRVTN',
  'BENE_STATE_DESC',
  'BENE_COUNTY_DESC',
  'BENE_FIPS_CD',
  'YEAR',
  'MONTH',
  'TOT_BENES',
  'ORGNL_MDCR_BENES',
  'MA_AND_OTH_BENES',
  'PRSCRPTN_DRUG_TOT_BENES',
  'PRSCRPTN_DRUG_PDP_BENES',
  'PRSCRPTN_DRUG_MAPD_BENES',
];

function parseCountyRow(row) {
  return {
    state: row.BENE_STATE_ABRVTN,
    stateName: row.BENE_STATE_DESC,
    county: row.BENE_COUNTY_DESC,
    fips: row.BENE_FIPS_CD,
    year: row.YEAR,
    month: row.MONTH,
    ...parseEnrollmentFields(row),
  };
}

async function fetchCountiesForState(options = {}, { signal } = {}) {
  const { state, year, month } = options;

  if (!state) {
    throw new Error('fetchCountiesForState requires options.state (e.g. \'NY\')');
  }

  const hasPeriod = Boolean(year && month);

  const queryParams = new URLSearchParams({
    'filter[BENE_GEO_LVL]': 'County',
    'filter[BENE_STATE_ABRVTN]': state,
    ...(hasPeriod ? { 'filter[YEAR]': year, 'filter[MONTH]': month } : {}),
    'sort[YEAR]': 'DESC',
    'sort[MONTH]': 'DESC',
    column: COUNTY_COLUMNS.join(','),
      size: hasPeriod ? '300' : '5000',
  });

  const rawData = await cmsGet(queryParams, { signal });
  // 'Unknown' is the API's catch-all bucket for unreported counties
  //  Dropped here rather filtering out individually.
  const data = rawData.filter((row) => row.MONTH !== 'Year' && row.BENE_COUNTY_DESC !== 'Unknown');

  if (hasPeriod) {
    return data.map(parseCountyRow);
  }

  const latestYear = data[0].YEAR;
  const latestMonth = data[0].MONTH;

  return data
    .filter((row) => row.YEAR === latestYear && row.MONTH === latestMonth)
    .map(parseCountyRow);
}

// Fetches once and returns both yearly/monthly slices
export async function fetchCountyEnrollment(options = {}, { signal } = {}) {
  const { state, county } = options;

  if (!state || !county) {
    throw new Error('fetchCountyEnrollment requires options.state and options.county (e.g. { state: \'NY\', county: \'Kings\' })');
  }

  const queryParams = new URLSearchParams({
    'filter[BENE_GEO_LVL]': 'County',
    'filter[BENE_STATE_ABRVTN]': state,
    'filter[BENE_COUNTY_DESC]': county,
    'sort[YEAR]': 'DESC',
    'sort[MONTH]': 'DESC',
    column: COUNTY_COLUMNS.join(','),
    size: '600',
  });

  const rawData = await cmsGet(queryParams, { signal });
  const parsedRows = rawData.map(parseCountyRow);

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

export default fetchCountiesForState;
