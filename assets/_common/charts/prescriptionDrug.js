import renderLineChart from './lineChart';
import renderStackedBarChart from './stackedBarChart';
import {
  sortYearlyAscending,
  sortMonthlyAscending,
  formatPeriod,
  LINE_CHART_COLORS
} from './utils';
import { drugYearly, drugMonthly } from '../tables/prescriptionDrug/tableColumns';
import DASHBOARD_LABELS from '../js/labels';

const { total, type1, type2 } = DASHBOARD_LABELS.prescriptionDrug;

const DRUG_LINE_SERIES = [
  { key: total.key, label: total.label, color: LINE_CHART_COLORS[total.colorKey], primary: true },
  { key: type1.key, label: type1.chartLabel || type1.label, color: LINE_CHART_COLORS[type1.colorKey], dash: type1.dash },
  { key: type2.key, label: type2.label, color: LINE_CHART_COLORS[type2.colorKey], dash: type2.dash },
];

const DRUG_STACK_SEGMENTS = [
  { key: type2.percentKey, countKey: type2.key, label: type2.label, color: LINE_CHART_COLORS[type2.colorKey] },
  { key: type1.percentKey, countKey: type1.key, label: type1.chartLabel || type1.label, color: LINE_CHART_COLORS[type1.colorKey] },
];

const monthTick = (d) => d.month.slice(0, 3);

/**
 * Prescription Drug — yearly enrollment count line chart.
 * @param {string} selector
 * @param {Array} data
 * @param {Object} [extra]
 */
export function renderDrugYearlyLineChart(selector, data, extra = {}) {
  const sorted = sortYearlyAscending(data);
  renderLineChart(selector, sorted, {
    series: DRUG_LINE_SERIES,
    xAccessor: (d) => String(d.year),
    title: 'Prescription Drug Enrollment Count Yearly Trend',
    tableColumns: drugYearly,
    ...extra,
  });
}

/**
 * Prescription Drug — 12-month enrollment count line chart.
 * @param {string} selector
 * @param {Array} data
 * @param {Object} [extra]
 */
export function renderDrugMonthlyLineChart(selector, data, extra = {}) {
  const sorted = sortMonthlyAscending(data);
  renderLineChart(selector, sorted, {
    series: DRUG_LINE_SERIES,
    xAccessor: formatPeriod,
    xTickFormat: monthTick,
    title: 'Prescription Drug Enrollment Count 12-Month Trend',
    tableColumns: drugMonthly,
    ...extra,
  });
}

/**
 * Prescription Drug — yearly percent-of-total stacked bar chart.
 * @param {string} selector
 * @param {Array} data
 * @param {Object} [extra]
 */
export function renderDrugYearlyStackedBarChart(selector, data, extra = {}) {
  const sorted = sortYearlyAscending(data);
  renderStackedBarChart(selector, sorted, {
    segments: DRUG_STACK_SEGMENTS,
    xAccessor: (d) => String(d.year),
    title: 'Prescription Drug Percent of Total Enrollment Yearly Trend',
    tableColumns: drugYearly,
    ...extra,
  });
}

/**
 * Prescription Drug — 12-month percent-of-total stacked bar chart.
 * @param {string} selector
 * @param {Array} data
 * @param {Object} [extra]
 */
export function renderDrugMonthlyStackedBarChart(selector, data, extra = {}) {
  const sorted = sortMonthlyAscending(data);
  renderStackedBarChart(selector, sorted, {
    segments: DRUG_STACK_SEGMENTS,
    xAccessor: formatPeriod,
    xTickFormat: monthTick,
    title: 'Prescription Drug Percent of Total Enrollment 12-Month Trend',
    tableColumns: drugMonthly,
    ...extra,
  });
}
