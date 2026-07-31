export async function instantiateWasmModule(wasmUrl, imports) {
  const response = await fetch(wasmUrl);
  const fallbackResponse = response.clone();

  if (typeof WebAssembly.instantiateStreaming === "function") {
    try {
      const { instance } = await WebAssembly.instantiateStreaming(response, imports);
      return instance;
    } catch {
      // Fall back when dev servers do not serve wasm with the expected MIME type.
    }
  }

  const bytes = await fallbackResponse.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, imports);
  return instance;
}
