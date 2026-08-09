import { createUnprovenDeployTx } from "@midnight-ntwrk/midnight-js-contracts";
import { sampleSigningKey } from "@midnight-ntwrk/compact-runtime";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { Contract } from "../src/contracts/talentcompass-guard/index.js";
import { Transaction } from "@midnight-ntwrk/ledger-v8";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
setNetworkId("Undeployed");
const zkConfigProvider = {
  getContractInfo: () => Promise.resolve({
    "compiler-version": "0.30.0",
    "language-version": "0.22.0",
    "runtime-version": "0.15.0",
    "circuits": [{
      "name": "verifyCandidate",
      "pure": false,
      "proof": true,
      "arguments": [{ "name": "aiScore", "type": { "type-name": "Uint", "maxval": 18446744073709551615n } }],
      "result-type": { "type-name": "Tuple", "types": [] }
    }]
  }),
  getCircuitConfig: () => Promise.resolve({}),
  getVerifierKey: () => Promise.resolve(new Uint8Array()),
  getProverKey: () => Promise.resolve(new Uint8Array()),
  getCircuitZkir: () => Promise.resolve(new Uint8Array()),
};

const compiled = CompiledContract.make("talentcompass-guard", Contract);
const withWitnesses = CompiledContract.withWitnesses(compiled, {});
const walletProvider = {
  getCoinPublicKey: () => "00".repeat(32),
  getEncryptionPublicKey: () => "00".repeat(32),
};

async function run() {
  try {
    const deployTxData = await createUnprovenDeployTx(
      { zkConfigProvider, walletProvider },
      {
        compiledContract: withWitnesses,
        args: [],
        initialPrivateState: {},
        signingKey: sampleSigningKey(),
      },
    );
    const unprovenTx = deployTxData.private.unprovenTx;
    console.log("Unproven Tx generated.");
    const tx = Transaction.deserialize("signature", "unproven", "pre-binding", unprovenTx.serialize());
    
    // Let's inspect intents
    console.log(tx.intents);
    const intents = Array.from(tx.intents.values());
    console.log("Intents:", intents);
    for (const entry of intents) {
      const intent = Array.isArray(entry) ? entry[1] : entry;
      const actions = intent.actions;
      console.log("Actions:", actions);
      if (actions) {
        for (const action of actions.values()) {
          console.log("Action type:", action.constructor.name);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
