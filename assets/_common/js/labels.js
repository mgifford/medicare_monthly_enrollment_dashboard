// Single source of truth for the enrollment-program labels shown across both
// dashboard views. Renaming a program (e.g. FFS -> OM) or re-labeling a
// column should only ever require editing the entries below.
//
// Each dashboard view has a "type1" (the map's primary/colored metric) and a
// "type2" (its comparison metric)
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
