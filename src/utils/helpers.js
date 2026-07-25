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

// NaN (not 0) when totalVal is 0 -- CMS uses '*' to suppress small counts for
// privacy, which num() parses as 0. A real 0% and "we don't know" need to
// stay distinguishable, since consumers like computeJenksBreaks and
// renderTierHistogram already filter out NaN as "no data" rather than
// counting it as a real data point.
export const getPercent = (count, totalVal) =>
  (totalVal > 0 ? parseFloat(((count / totalVal) * 100).toFixed(2)) : NaN);

export const num = (val) => parseInt(val, 10) || 0;

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

