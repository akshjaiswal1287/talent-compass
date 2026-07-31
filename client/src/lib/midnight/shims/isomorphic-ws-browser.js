if (!globalThis.WebSocket) {
  throw new Error('Browser WebSocket API missing.');
}

export const WebSocket = globalThis.WebSocket;
export default globalThis.WebSocket;
