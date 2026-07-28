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

// NaN when totalVal is 0, OR when count itself is suppressed (see num()
// below) -- a real 0% and "we don't know" need to stay distinguishable,
// since consumers like computeJenksBreaks and renderTierHistogram already
// filter out NaN as "no data" rather than counting it as a real data point.
// Percent displays don't need to tell these two NaN causes apart (they both
// just show "-") -- the count field sitting next to the percent is what
// carries the "Suppressed" vs. real-zero distinction, via formatCount().
export const getPercent = (count, totalVal) =>
  (totalVal > 0 && Number.isFinite(count) ? parseFloat(((count / totalVal) * 100).toFixed(2)) : NaN);

// null (not 0) for non-numeric input -- CMS uses '*' to suppress small
// beneficiary counts for privacy, and a suppressed count must stay
// distinguishable from a genuine 0. null (unlike NaN) survives the
// sessionStorage JSON round-trip in router.js unchanged.
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

