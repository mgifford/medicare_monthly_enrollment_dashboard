import { baseUrl } from '../config';

const RETRY_DELAY_MS = 500;
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

async function doFetch(queryParams, signal) {
  const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`CMS API responded with status: ${response.status}`);
  }

  return response.json();
}

// One single retry for a transient network/5xx blip
async function cmsGet(queryParams, { signal } = {}) {
  try {
    return await doFetch(queryParams, signal);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    await wait(RETRY_DELAY_MS);
    return doFetch(queryParams, signal);
  }
}

export default cmsGet;