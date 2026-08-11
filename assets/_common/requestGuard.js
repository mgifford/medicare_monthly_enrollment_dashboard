// "Latest wins" for async request sequences: each next() cancels whatever
// was previously in flight and returns a fresh signal
function createRequestGuard() {
  let controller = null;
  let token = 0;

  return {
    next() {
      controller?.abort();
      controller = new AbortController();
      token += 1;
      const requestToken = token;
      return { signal: controller.signal, isStale: () => requestToken !== token };
    },
  };
}

export default createRequestGuard;
