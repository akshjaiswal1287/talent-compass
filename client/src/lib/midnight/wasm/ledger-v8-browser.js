import ledgerWasmUrl from "../../../../node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm_bg.wasm?url";
import * as ledgerBindings from "../../../../node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm_bg.js";
import { instantiateWasmModule } from "./instantiate-wasm.js";

let ledgerWasmExports;

const snippetBase = "./snippets/midnight-ledger-wasm-9f71df61dc0427fb";

const ledgerImports = {
  "./midnight_ledger_wasm_bg.js": ledgerBindings,
  [`${snippetBase}/inline0.js`]: { PreTranscript_: () => ledgerWasmExports.PreTranscript },
  [`${snippetBase}/inline1.js`]: { UnshieldedOffer_: () => ledgerWasmExports.UnshieldedOffer },
  [`${snippetBase}/inline2.js`]: { ZswapInput_: () => ledgerWasmExports.ZswapInput },
  [`${snippetBase}/inline3.js`]: { ZswapTransient_: () => ledgerWasmExports.ZswapTransient },
  [`${snippetBase}/inline4.js`]: { ZswapOffer_: () => ledgerWasmExports.ZswapOffer },
  [`${snippetBase}/inline5.js`]: { ZswapOutput_: () => ledgerWasmExports.ZswapOutput },
  [`${snippetBase}/inline6.js`]: { PrePartitionContractCall_: () => ledgerWasmExports.PrePartitionContractCall },
  [`${snippetBase}/inline7.js`]: { DustSpend_: () => ledgerWasmExports.DustSpend },
  [`${snippetBase}/inline8.js`]: { DustActions_: () => ledgerWasmExports.DustActions },
  [`${snippetBase}/inline9.js`]: { DustRegistration_: () => ledgerWasmExports.DustRegistration },
  [`${snippetBase}/inline10.js`]: { NoBinding_: () => ledgerWasmExports.NoBinding },
  [`${snippetBase}/inline11.js`]: { SignatureErased_: () => ledgerWasmExports.SignatureErased },
  [`${snippetBase}/inline12.js`]: { PreBinding_: () => ledgerWasmExports.PreBinding },
  [`${snippetBase}/inline13.js`]: { SignatureEnabled_: () => ledgerWasmExports.SignatureEnabled },
  [`${snippetBase}/inline14.js`]: { Binding_: () => ledgerWasmExports.Binding },
  [`${snippetBase}/inline15.js`]: { Proof_: () => ledgerWasmExports.Proof },
  [`${snippetBase}/inline16.js`]: { PreProof_: () => ledgerWasmExports.PreProof },
  [`${snippetBase}/inline17.js`]: { Intent_: () => ledgerWasmExports.Intent },
  [`${snippetBase}/inline18.js`]: { ContractCall_: () => ledgerWasmExports.ContractCall },
  [`${snippetBase}/inline19.js`]: { ReplaceAuthority_: () => ledgerWasmExports.ReplaceAuthority },
  [`${snippetBase}/inline20.js`]: { MaintenanceUpdate_: () => ledgerWasmExports.MaintenanceUpdate },
  [`${snippetBase}/inline21.js`]: { VerifierKeyInsert_: () => ledgerWasmExports.VerifierKeyInsert },
  [`${snippetBase}/inline22.js`]: { VerifierKeyRemove_: () => ledgerWasmExports.VerifierKeyRemove },
  [`${snippetBase}/inline23.js`]: { ContractDeploy_: () => ledgerWasmExports.ContractDeploy },
};

const ledgerInstance = await instantiateWasmModule(ledgerWasmUrl, ledgerImports);
ledgerWasmExports = ledgerInstance.exports;
ledgerBindings.__wbg_set_wasm(ledgerWasmExports);
ledgerWasmExports.__wbindgen_start();

export * from "../../../../node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm_bg.js";
