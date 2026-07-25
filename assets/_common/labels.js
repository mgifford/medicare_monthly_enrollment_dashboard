// Single source of truth for the enrollment-program labels shown across both
// dashboard views (hero card, state/county map, trend charts, grid/drawer
// tables). To rename or relabel a program (e.g. the FFS -> OM rename), just
// edit the strings below -- nothing else in the codebase needs to change.
//
// Field guide:
//   label       - short display text (table headers, legends, hero card)
//   labelLong   - full display text (hero card's accessible table, tooltips)
//   chartLabel  - optional override of `label` just for trend chart legends
//                 and tooltips (falls back to `label` if omitted)
//   colorKey    - must match a key in LINE_CHART_COLORS
//                 (assets/_common/charts/utils.js) -- adding a brand-new
//                 program needs a color added there first
//   dash        - 'dashed' | 'dotted', the line chart's stroke pattern for
//                 this program (keeps type1 vs type2 tellable apart without
//                 relying on color alone)
//   key / percentKey - the raw count/percent field names as returned by the
//                 API. These are data wiring, not display text -- only
//                 change them if the underlying dataset field itself renames.
//
// Each dashboard view has a "type1" (the map's primary/colored metric) and a
// "type2" (its comparison metric).
const DASHBOARD_LABELS = {
  hospitalMedical: {
    heroTitle: 'Medicare enrollment by program type',
    total: { key: 'totalEnrollees', label: 'TOTAL', colorKey: 'total' },
    type1: {
      key: 'maCount',
      percentKey: 'maPercent',
      label: 'MA',
      labelLong: 'Medicare Advantage (MA) & Other Health Plans',
      colorKey: 'ma',
      dash: 'dashed',
    },
    type2: {
      key: 'omCount',
      percentKey: 'omPercent',
      label: 'OM',
      labelLong: 'Original Medicare (OM)',
      colorKey: 'om',
      dash: 'dotted',
    },
  },
  prescriptionDrug: {
    heroTitle: 'Medicare Prescription Drug enrollment by plan type',
    total: { key: 'drugTotal', label: 'TOTAL', colorKey: 'total' },
    type1: {
      key: 'mapdCount',
      percentKey: 'mapdPercent',
      label: 'MAPD',
      chartLabel: 'MAPD',
      labelLong: 'Medicare Advantage Prescription Drug Plans (MAPD)',
      colorKey: 'mapd',
      dash: 'dashed',
    },
    type2: {
      key: 'pdpCount',
      percentKey: 'pdpPercent',
      label: 'PDP',
      labelLong: 'Stand-Alone Prescription Drug Plans (PDP)',
      colorKey: 'pdp',
      dash: 'dotted',
    },
  },
};

export default DASHBOARD_LABELS;
