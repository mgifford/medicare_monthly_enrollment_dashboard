import * as d3 from 'd3';
import DASHBOARD_LABELS from '../../js/labels';

const num = d3.format(',');
const pct = (v) => `${v}%`;

const { type1, type2 } = DASHBOARD_LABELS.hospitalMedical;

export const hospitalYearly = [
  { label: 'Year', value: (d) => d.year },
  { label: 'Total Enrolled', value: (d) => num(d.totalEnrollees) },
  { label: type1.label, value: (d) => num(d[type1.key]) },
  { label: type2.label, value: (d) => num(d[type2.key]) },
  { label: `${type1.label} %`, value: (d) => pct(d[type1.percentKey]) },
  { label: `${type2.label} %`, value: (d) => pct(d[type2.percentKey]) },
];

export const hospitalMonthly = [
  { label: 'Year', value: (d) => d.year },
  { label: 'Month', value: (d) => d.month },
  { label: 'Total Enrolled', value: (d) => num(d.totalEnrollees) },
  { label: type1.label, value: (d) => num(d[type1.key]) },
  { label: type2.label, value: (d) => num(d[type2.key]) },
  { label: `${type1.label} %`, value: (d) => pct(d[type1.percentKey]) },
  { label: `${type2.label} %`, value: (d) => pct(d[type2.percentKey]) },
];
