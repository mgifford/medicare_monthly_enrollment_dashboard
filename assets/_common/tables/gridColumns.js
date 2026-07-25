import * as d3 from 'd3';
import DASHBOARD_LABELS from '../labels';
import usStates from '../../../_data/usStates.json';

const formatNum = d3.format(',');

// API's "State" geo level includes territories (e.g. Puerto Rico) --
// can't be handed off to the map, so grid/drawer render them disabled
// with a warning label instead.
const mappableStateNames = new Set(usStates);

const hospitalLabels = DASHBOARD_LABELS.hospitalMedical;
const drugLabels = DASHBOARD_LABELS.prescriptionDrug;
const dashboardLabelsFor = (type) => (type === 'drug' ? drugLabels : hospitalLabels);

export const rowTotal = (type, d) => (type === 'drug' ? d.drugTotal : d.totalEnrollees);

const roundPct = (v) => (Number.isFinite(v) ? `${Math.round(v)}%` : 'No data');

const compactNum = (n) => {
  const value = Number(n) || 0;
  if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 1 : 2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)}K`;
  return formatNum(value);
};

const countCol = (label, getter) => ({
  label,
  html: (d) => {
    const n = getter(d);
    return `<span class="num-full">${formatNum(n)}</span><span class="num-abbr">${compactNum(n)}</span>`;
  },
  sortValue: getter,
});

const stateNameColumn = {
  label: 'State',
  value: (d) => d.stateName,
  sortValue: (d) => d.stateName,
  html: (d) => (mappableStateNames.has(d.stateName)
    ? d.stateName
    : `${d.stateName} <span class="data-grid-unmappable-note" title="Not part of the state map — this area can't be selected."><svg class="data-grid-unmappable-note__icon" aria-hidden="true" focusable="false"><use xlink:href="#svg-warning"></use></svg>Not on map</span>`),
};

// Counties with no data (ex. Kalawao County, HI) still show up here, flagged
// and unselectable, rather than silently dropped -- they're still visible
// on the map.
const countyNameColumnFor = (type) => ({
  label: 'County',
  value: (d) => d.county,
  sortValue: (d) => d.county,
  html: (d) => (rowTotal(type, d) > 0
    ? d.county
    : `${d.county} <span class="data-grid-unmappable-note" title="No enrollment data available for this county."><svg class="data-grid-unmappable-note__icon" aria-hidden="true" focusable="false"><use xlink:href="#svg-warning"></use></svg>No data</span>`),
});

function buildAreaColumns(labels) {
  return [
    stateNameColumn,
    countCol('TOTAL', (d) => d[labels.total.key]),
    countCol(labels.type1.label, (d) => d[labels.type1.key]),
    countCol(labels.type2.label, (d) => d[labels.type2.key]),
    { label: `${labels.type1.label} %`, value: (d) => roundPct(d[labels.type1.percentKey]), sortValue: (d) => d[labels.type1.percentKey] },
    { label: `${labels.type2.label} %`, value: (d) => roundPct(d[labels.type2.percentKey]), sortValue: (d) => d[labels.type2.percentKey] },
  ];
}

function buildCountyColumns(type, labels) {
  return [
    countyNameColumnFor(type),
    countCol('TOTAL', (d) => d[labels.total.key]),
    countCol(labels.type1.label, (d) => d[labels.type1.key]),
    countCol(labels.type2.label, (d) => d[labels.type2.key]),
    { label: `${labels.type1.label} %`, value: (d) => roundPct(d[labels.type1.percentKey]), sortValue: (d) => d[labels.type1.percentKey] },
    { label: `${labels.type2.label} %`, value: (d) => roundPct(d[labels.type2.percentKey]), sortValue: (d) => d[labels.type2.percentKey] },
  ];
}

const hospitalAreaColumns = buildAreaColumns(hospitalLabels);
const drugAreaColumns = buildAreaColumns(drugLabels);
const hospitalCountyColumns = buildCountyColumns('hospital', hospitalLabels);
const drugCountyColumns = buildCountyColumns('drug', drugLabels);

export const areaColumnsFor = (type) => (type === 'drug' ? drugAreaColumns : hospitalAreaColumns);
export const countyColumnsFor = (type) => (type === 'drug' ? drugCountyColumns : hospitalCountyColumns);

// range is passed explicitly (rather than read from caller-side state) so
// this stays a pure function of its arguments.
export function buildTrendGridColumns(type, range) {
  const periodCols = range === 'monthly'
    ? [{ label: 'Year', value: (d) => d.year }, { label: 'Month', value: (d) => d.month }]
    : [{ label: 'Year', value: (d) => d.year }];

  const { total, type1, type2 } = dashboardLabelsFor(type);

  return [
    ...periodCols,
    { label: 'Total', value: (d) => formatNum(d[total.key]) },
    { label: type1.label, value: (d) => formatNum(d[type1.key]) },
    { label: type2.label, value: (d) => formatNum(d[type2.key]) },
    { label: `${type1.label} %`, value: (d) => roundPct(d[type1.percentKey]) },
    { label: `${type2.label} %`, value: (d) => roundPct(d[type2.percentKey]) },
  ];
}
