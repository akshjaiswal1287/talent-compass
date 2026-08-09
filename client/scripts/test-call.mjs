import { createUnprovenCallTxFromInitialStates } from "@midnight-ntwrk/midnight-js-contracts";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { Contract } from "../src/contracts/talentcompass-guard/index.js";
import { Transaction, CostModel } from "@midnight-ntwrk/ledger-v8";
import { httpClientProvingProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { ContractState } from "@midnight-ntwrk/compact-runtime";
import fs from "fs/promises";
import path from "path";

setNetworkId("Undeployed");

async function run() {
  const assetsDir = path.resolve("../public/midnight-assets/talentcompass-guard");
  
  const zkConfigProvider = {
    get: async (circuitId) => {
      return {
        circuitId,
        verifierKey: await fs.readFile(path.join(assetsDir, circuitId + ".verifier")),
        proverKey: await fs.readFile(path.join(assetsDir, circuitId + ".prover")),
        zkir: await fs.readFile(path.join(assetsDir, circuitId + ".bzkir")),
      };
    }
  };

  const compiled = CompiledContract.make("talentcompass-guard", Contract);
  const withWitnesses = CompiledContract.withWitnesses(compiled, {
    dummyWitness: (context) => [context.privateState, 0n]
  });
  const withAssets = CompiledContract.withCompiledFileAssets(withWitnesses, "mock");
  
  const walletProvider = {
    getCoinPublicKey: () => "00".repeat(32),
    getEncryptionPublicKey: () => "00".repeat(32),
  };

  const { indexerPublicDataProvider } = await import("@midnight-ntwrk/midnight-js-indexer-public-data-provider");
  const { getPublicStates } = await import("@midnight-ntwrk/midnight-js-contracts");
  const publicDataProvider = indexerPublicDataProvider("https://indexer.preprod.midnight.network/api/v1/graphql", "wss://indexer.preprod.midnight.network/api/v1/graphql/ws");
  const publicStates = await getPublicStates(publicDataProvider, "885e33d0774a88bc3c6b22eb1f1a54728fbe5d85ffcccdb1e777473b6cf90cf1");

  console.log("Generating unproven tx...");
  const callTxData = await createUnprovenCallTxFromInitialStates(zkConfigProvider, {
    compiledContract: withAssets,
    circuitId: "verifyCandidate",
    contractAddress: "885e33d0774a88bc3c6b22eb1f1a54728fbe5d85ffcccdb1e777473b6cf90cf1",
    args: [80n],
    coinPublicKey: "00".repeat(32),
    initialContractState: publicStates.contractState,
    initialZswapChainState: publicStates.zswapChainState,
    ledgerParameters: publicStates.ledgerParameters,
    initialPrivateState: {},
  }, "00".repeat(32));

  const unprovenTx = callTxData.private.unprovenTx;
  console.log("Circuits to prove:", unprovenTx.circuitsToProve.map(c => c.circuitId));
  
  const baseProvingProvider = httpClientProvingProvider("https://proof.preprod.midnight.network", zkConfigProvider);
  const costModel = CostModel.initialCostModel();
  console.log("Proving...");
  const provenTx = await unprovenTx.prove(baseProvingProvider, costModel);
  
  const serialized = provenTx.serialize();
  console.log("Proven header:", Buffer.from(serialized).toString("utf8").split("):")[0]);
}
run().catch(console.error);
