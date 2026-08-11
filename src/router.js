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

// A tab left open longer than this refetches
const CACHE_MAX_AGE_MS = 60 * 60 * 1000;

// signal is a per-caller cancellation handle, but it only takes effect for the
// caller that actually starts the request. If a request for the same cache key
// is already in flight, later callers join that promise and their signal is
// ignored.
async function requestDataset(serviceName, options = {}, { signal } = {}) {
  const targetFunction = functionRegistry[serviceName];

  if (!targetFunction) {
    throw new Error(
      `Dataset function '${serviceName}' not found. Available options: ${Object.keys(functionRegistry).join(', ')}`,
    );
  }

  const cacheKey = `${serviceName}:${JSON.stringify(options)}`;

  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { data, cachedAt } = JSON.parse(cached);
    if (Date.now() - cachedAt < CACHE_MAX_AGE_MS) return data;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    const data = await targetFunction(options, { signal });

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data, cachedAt: Date.now() }));
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
