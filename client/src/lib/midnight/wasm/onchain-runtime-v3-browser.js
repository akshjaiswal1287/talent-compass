import onchainRuntimeWasmUrl from "../../../../node_modules/@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm?url";
import * as onchainRuntimeBindings from "../../../../node_modules/@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.js";
import { instantiateWasmModule } from "./instantiate-wasm.js";

const onchainRuntimeImports = {
  "./midnight_onchain_runtime_wasm_bg.js": onchainRuntimeBindings,
};

const onchainRuntimeInstance = await instantiateWasmModule(onchainRuntimeWasmUrl, onchainRuntimeImports);
const onchainRuntimeExports = onchainRuntimeInstance.exports;

onchainRuntimeBindings.__wbg_set_wasm(onchainRuntimeExports);
onchainRuntimeExports.__wbindgen_start();

export * from "../../../../node_modules/@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.js";
