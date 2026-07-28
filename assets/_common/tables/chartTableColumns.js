import DASHBOARD_LABELS from '../labels';
import { formatCount, formatPercent } from '../charts/utils';

// Screen-reader-only accessible table columns for the trend line/bar charts.
// Shared shape for both dashboard views -- only the total field and the
// type1/type2 labels differ, sourced from DASHBOARD_LABELS.
function buildColumns({ totalKey, type1, type2, hasMonth }) {
  const periodCols = hasMonth
    ? [{ label: 'Year', value: (d) => d.year }, { label: 'Month', value: (d) => d.month }]
    : [{ label: 'Year', value: (d) => d.year }];

  return [
    ...periodCols,
    { label: 'Total Enrolled', value: (d) => formatCount(d[totalKey]) },
    { label: type1.label, value: (d) => formatCount(d[type1.key]) },
    { label: type2.label, value: (d) => formatCount(d[type2.key]) },
    { label: `${type1.label} %`, value: (d) => formatPercent(d[type1.percentKey]) },
    { label: `${type2.label} %`, value: (d) => formatPercent(d[type2.percentKey]) },
  ];
}

const { hospitalMedical, prescriptionDrug } = DASHBOARD_LABELS;

export const hospitalYearly = buildColumns({ totalKey: 'totalEnrollees', ...hospitalMedical, hasMonth: false });
export const hospitalMonthly = buildColumns({ totalKey: 'totalEnrollees', ...hospitalMedical, hasMonth: true });
export const drugYearly = buildColumns({ totalKey: 'drugTotal', ...prescriptionDrug, hasMonth: false });
export const drugMonthly = buildColumns({ totalKey: 'drugTotal', ...prescriptionDrug, hasMonth: true });
