import "@midnight-ntwrk/dapp-connector-api";

export function desiredMidnightNetwork() {
  return "preprod";
}

export function detectMidnightConnector() {
  if (typeof window === "undefined") return null;
  const connectors = window.midnight ?? {};
  return (
    connectors.mnLace ??
    connectors.mn1AM ??
    connectors["1am"] ??
    connectors.lace ??
    Object.values(connectors)[0] ??
    null
  );
}
