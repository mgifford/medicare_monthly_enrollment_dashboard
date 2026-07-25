import fetchNationalData from './datasets/nationalEnrollment';
import fetchCountiesForState, { fetchCountyEnrollment } from './datasets/countyEnrollment';
import { fetchAllStates, fetchStateEnrollment } from './datasets/stateEnrollment';

const functionRegistry = {
  nationalEnrollment: fetchNationalData,
  countyEnrollment: fetchCountiesForState,
  countyTrend: fetchCountyEnrollment,
  allStates: fetchAllStates,
  stateEnrollment: fetchStateEnrollment,
};

// Tracks in-flight requests by cache key so concurrent callers for the same
// dataset share one fetch instead of racing duplicate network requests 
const pendingRequests = new Map();

// signal is a per-caller cancellation handle
// If two callers request the exact same cache key concurrently,
// the fetch is aborted
async function requestDataset(serviceName, options = {}, { signal } = {}) {
  const targetFunction = functionRegistry[serviceName];

  if (!targetFunction) {
    throw new Error(`Dataset function '${serviceName}' not found. Available options: ${Object.keys(functionRegistry).join(', ')}`);
  }

  const cacheKey = `${serviceName}:${JSON.stringify(options)}`;

  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    const data = await targetFunction(options, { signal });

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      // sessionStorage full/unavailable -- caching is best-effort, not required
    }

    return data;
  })();

  pendingRequests.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

export default requestDataset;