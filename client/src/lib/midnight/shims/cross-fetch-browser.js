const boundFetch = globalThis.fetch?.bind(globalThis);

if (!boundFetch) {
  throw new Error('Browser fetch API missing.');
}

export const fetch = boundFetch;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
export default boundFetch;
