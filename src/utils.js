export const monthOrder = {
  'January': 1,
  'February': 2,
  'March': 3,
  'April': 4,
  'May': 5,
  'June': 6,
  'July': 7,
  'August': 8,
  'September': 9,
  'October': 10,
  'November': 11,
  'December': 12
};

// Sorts by most recent first because
// the API sorts MONTH alphabetically instead of chronologically
export function sortDescByPeriod(rows) {
  return [...rows].sort((a, b) => {
    if (Number(b.year) !== Number(a.year)) return Number(b.year) - Number(a.year);
    return monthOrder[b.month] - monthOrder[a.month];
  });
}

// Returns NaN when we can't calculate a real percent
export const getPercent = (count, totalVal) =>
  (totalVal > 0 && Number.isFinite(count) ? parseFloat(((count / totalVal) * 100).toFixed(2)) : NaN);

// CMS writes '*' instead of a number to hide small counts for privacy.
// Returns null so "hidden" and a real zero don't look the same.
export const num = (val) => {
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

// Shared numeric fields present on every enrollment row (national/state/county).
// Callers spread this plus their own geo-specific fields (state, county, etc.).
export function parseEnrollmentFields(row) {
  const total = num(row.TOT_BENES);
  const drugTotal = num(row.PRSCRPTN_DRUG_TOT_BENES);

  return {
    totalEnrollees: total,
    omCount: num(row.ORGNL_MDCR_BENES),
    maCount: num(row.MA_AND_OTH_BENES),
    omPercent: getPercent(num(row.ORGNL_MDCR_BENES), total),
    maPercent: getPercent(num(row.MA_AND_OTH_BENES), total),
    drugTotal,
    pdpCount: num(row.PRSCRPTN_DRUG_PDP_BENES),
    mapdCount: num(row.PRSCRPTN_DRUG_MAPD_BENES),
    pdpPercent: getPercent(num(row.PRSCRPTN_DRUG_PDP_BENES), drugTotal),
    mapdPercent: getPercent(num(row.PRSCRPTN_DRUG_MAPD_BENES), drugTotal),
  };
}

