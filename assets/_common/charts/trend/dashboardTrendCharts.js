import renderLineChart from './lineChart';
import renderStackedBarChart from './stackedBarChart';
import { sortYearlyAscending, sortMonthlyAscending, formatPeriod } from '../utils';
import {
  hospitalYearly,
  hospitalMonthly,
  drugYearly,
  drugMonthly,
} from '../../tables/chartTableColumns';
import DASHBOARD_LABELS from '../../labels';

const monthTick = (d) => d.month.slice(0, 3);

function buildSeries({ total, type1, type2 }) {
  return [
    { key: total.key, label: total.label, color: total.color, primary: true },
    { key: type1.key, label: type1.label, color: type1.color, dash: type1.dash },
    { key: type2.key, label: type2.label, color: type2.color, dash: type2.dash },
  ];
}

function buildSegments({ type1, type2 }) {
  return [
    { key: type2.percentKey, countKey: type2.key, label: type2.label, color: type2.color },
    { key: type1.percentKey, countKey: type1.key, label: type1.label, color: type1.color },
  ];
}

// One dashboard view's set of 4 trend-chart render functions (yearly/monthly
// x line/stacked-bar) -- the only things that differ between the Hospital/
// Medical and Prescription Drug views are the series/segment config and the
// accessible-table columns, both sourced from DASHBOARD_LABELS.
function makeChartFns({ labels, tableColumns }) {
  const series = buildSeries(labels);
  const segments = buildSegments(labels);
  const { programName } = labels;

  return {
    yearlyLine: (selector, data, extra = {}) =>
      renderLineChart(selector, sortYearlyAscending(data), {
        series,
        xAccessor: (d) => String(d.year),
        title: `${programName} Enrollment Count Yearly Trend`,
        tableColumns: tableColumns.yearly,
        ...extra,
      }),
    monthlyLine: (selector, data, extra = {}) =>
      renderLineChart(selector, sortMonthlyAscending(data), {
        series,
        xAccessor: formatPeriod,
        xTickFormat: monthTick,
        title: `${programName} Enrollment Count 12-Month Trend`,
        tableColumns: tableColumns.monthly,
        ...extra,
      }),
    yearlyBar: (selector, data, extra = {}) =>
      renderStackedBarChart(selector, sortYearlyAscending(data), {
        segments,
        xAccessor: (d) => String(d.year),
        title: `${programName} Percent of Total Enrollment Yearly Trend`,
        tableColumns: tableColumns.yearly,
        ...extra,
      }),
    monthlyBar: (selector, data, extra = {}) =>
      renderStackedBarChart(selector, sortMonthlyAscending(data), {
        segments,
        xAccessor: formatPeriod,
        xTickFormat: monthTick,
        title: `${programName} Percent of Total Enrollment 12-Month Trend`,
        tableColumns: tableColumns.monthly,
        ...extra,
      }),
  };
}

const DASHBOARD_TREND_CHARTS = {
  hospital: makeChartFns({
    labels: DASHBOARD_LABELS.hospitalMedical,
    tableColumns: { yearly: hospitalYearly, monthly: hospitalMonthly },
  }),
  drug: makeChartFns({
    labels: DASHBOARD_LABELS.prescriptionDrug,
    tableColumns: { yearly: drugYearly, monthly: drugMonthly },
  }),
};

export default DASHBOARD_TREND_CHARTS;
