/**
 * URL state synchronization for the Medicare Enrollment Dashboard.
 * Reads/writes URL search params and dispatches custom events to keep
 * the dashboard state in sync with the browser address bar.
 */

function readParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get('type'),
    state: params.get('state'),
    range: params.get('range'),
    view: params.get('view'),
  };
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

  if (initial.type) {
    state.activeDashboardType = initial.type;
  }
  if (initial.range) {
    state.trend.activeTrendRange = initial.range;
  }
  if (initial.view) {
    state.trend.activeTrendView = initial.view;
  }

  // Defer writes so all other event handlers update state first
  const scheduleWrite = () => setTimeout(() => writeParams(state), 0);

  document.addEventListener('dashboard:typechange', scheduleWrite);
  document.addEventListener('dashboard:statechange', scheduleWrite);
  document.addEventListener('dashboard:stateclear', scheduleWrite);
  document.addEventListener('dashboard:rangechange', scheduleWrite);
  document.addEventListener('dashboard:viewchange', scheduleWrite);

  window.addEventListener('popstate', () => {
    const params = readParams();
    if (params.type && params.type !== state.activeDashboardType) {
      document.dispatchEvent(new CustomEvent('dashboard:typechange', {
        detail: { type: params.type }
      }));
    }
    if (params.state) {
      document.dispatchEvent(new CustomEvent('dashboard:statechange', {
        detail: { state: params.state }
      }));
    } else if (!params.state && state.selectedState) {
      document.dispatchEvent(new CustomEvent('dashboard:stateclear'));
    }
  });

  writeParams(state);

  return { initial };
}
