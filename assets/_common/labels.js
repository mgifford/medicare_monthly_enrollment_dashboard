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
//   color       - hex color for this series' line/legend/hero swatch
//   mapColors   - 5 hex colors, low-to-high, for this program's map
//                 choropleth scale
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
    mapColors: ['#f1eef6', '#d7b5d8', '#df65b0', '#dd1c77', '#980043'],
    total: { key: 'totalEnrollees', label: 'TOTAL', color: '#1b1b1b' },
    type1: {
      key: 'maCount',
      percentKey: 'maPercent',
      label: 'MA',
      labelLong: 'Medicare Advantage (MA) & Other Health Plans',
      color: '#961D56',
      dash: 'dashed',
    },
    type2: {
      key: 'omCount',
      percentKey: 'omPercent',
      label: 'OM',
      labelLong: 'Original Medicare (OM)',
      color: '#0074D9',
      dash: 'dotted',
    },
  },
  prescriptionDrug: {
    heroTitle: 'Medicare Prescription Drug enrollment by plan type',
    mapColors: ['#edf8fb', '#b2e2e2', '#66c2a4', '#2ca25f', '#006d2c'],
    total: { key: 'drugTotal', label: 'TOTAL', color: '#1b1b1b' },
    type1: {
      key: 'mapdCount',
      percentKey: 'mapdPercent',
      label: 'MAPD',
      chartLabel: 'MAPD',
      labelLong: 'Medicare Advantage Prescription Drug Plans (MAPD)',
      color: '#006d2c',
      dash: 'dashed',
    },
    type2: {
      key: 'pdpCount',
      percentKey: 'pdpPercent',
      label: 'PDP',
      labelLong: 'Stand-Alone Prescription Drug Plans (PDP)',
      color: '#E69F00',
      dash: 'dotted',
    },
  },
};

export default DASHBOARD_LABELS;
