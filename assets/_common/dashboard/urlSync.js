/**
 * URL state synchronization for the Medicare Enrollment Dashboard.
 * Reads/writes URL search params and dispatches custom events to keep
 * the dashboard state in sync with the browser address bar.
 */

const PARAM_MAP = {
  type: 'activeDashboardType',
  state: 'selectedStateAbbr',
  range: 'activeTrendRange',
  view: 'activeTrendView',
};

const VALID_VALUES = {
  type: ['hospital', 'drug'],
  range: ['yearly', 'monthly'],
  view: ['line', 'bar', 'grid'],
};

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, stateKey] of Object.entries(PARAM_MAP)) {
    const val = params.get(key);
    if (val != null) {
      if (VALID_VALUES[key] && !VALID_VALUES[key].includes(val)) continue;
      result[stateKey] = val;
    }
  }
  return result;
}

function writeParams(state) {
  const params = new URLSearchParams();
  if (state.activeDashboardType && state.activeDashboardType !== 'hospital') {
    params.set('type', state.activeDashboardType);
  }
  if (state.selectedState) {
    params.set('state', state.selectedState.state);
  }
  if (state.trend?.activeTrendRange && state.trend.activeTrendRange !== 'yearly') {
    params.set('range', state.trend.activeTrendRange);
  }
  if (state.trend?.activeTrendView && state.trend.activeTrendView !== 'line') {
    params.set('view', state.trend.activeTrendView);
  }
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

export function initUrlSync(state) {
  const initial = readParams();

  if (initial.activeDashboardType) {
    state.activeDashboardType = initial.activeDashboardType;
  }
  if (initial.activeTrendRange) {
    state.trend.activeTrendRange = initial.activeTrendRange;
  }
  if (initial.activeTrendView) {
    state.trend.activeTrendView = initial.activeTrendView;
  }

  document.addEventListener('dashboard:typechange', (e) => {
    writeParams(state);
  });

  document.addEventListener('dashboard:statechange', (e) => {
    writeParams(state);
  });

  document.addEventListener('dashboard:stateclear', () => {
    writeParams(state);
  });

  document.addEventListener('dashboard:rangechange', () => {
    writeParams(state);
  });

  document.addEventListener('dashboard:viewchange', () => {
    writeParams(state);
  });

  window.addEventListener('popstate', () => {
    const params = readParams();
    if (params.activeDashboardType && params.activeDashboardType !== state.activeDashboardType) {
      document.dispatchEvent(new CustomEvent('dashboard:typechange', {
        detail: { type: params.activeDashboardType }
      }));
    }
    if (params.selectedStateAbbr) {
      document.dispatchEvent(new CustomEvent('dashboard:statechange', {
        detail: { state: params.selectedStateAbbr }
      }));
    } else if (!params.selectedStateAbbr && state.selectedState) {
      document.dispatchEvent(new CustomEvent('dashboard:stateclear'));
    }
  });

  writeParams(state);

  return { initial };
}
