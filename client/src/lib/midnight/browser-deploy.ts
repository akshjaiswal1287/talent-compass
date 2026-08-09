import { DEPLOYED_CONTRACT_ADDRESS } from "./contract";
import { desiredMidnightNetwork, detectMidnightConnector } from "./wallet";

type ConnectedWallet = {
  getConfiguration: () => Promise<any>;
  getShieldedAddresses: () => Promise<any>;
  getProvingProvider: (config: any) => Promise<any>;
  balanceUnsealedTransaction: (txHex: string) => Promise<{ tx?: string }>;
  submitTransaction: (txHex: string) => Promise<unknown>;
  disconnect?: () => Promise<void> | void;
};

async function setBrowserNetworkId(networkId: string) {
  const { setNetworkId } = await import("@midnight-ntwrk/midnight-js-network-id");
  setNetworkId(networkId);
}

function hexToBytes(hex: string) {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error("Invalid hex string.");
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function buildCompiledContract() {
  return Promise.all([
    import("@midnight-ntwrk/midnight-js-protocol/compact-js"),
    import("../../contracts/talentcompass-guard/index.js"),
  ]).then(([{ CompiledContract }, contractBundle]) => {
    const compiled = CompiledContract.make("talentcompass-guard", contractBundle.Contract as never);
    return CompiledContract.withCompiledFileAssets(
      CompiledContract.withWitnesses(compiled, {
        dummyWitness: () => BigInt(0),
      }),
      "/midnight-assets/talentcompass-guard",
    );
  });
}

function createFlatZkConfigProvider() {
  const baseURL = new URL("/midnight-assets/talentcompass-guard/", window.location.origin).toString();

  async function readArtifact(ext: ".prover" | ".verifier" | ".bzkir", circuitId: string) {
    const response = await window.fetch(new URL(`${encodeURIComponent(circuitId)}${ext}`, baseURL));
    if (!response.ok) {
      throw new Error(`Failed to fetch ZK artifact from ${response.url}: ${response.status} ${response.statusText}`);
    }
    const bytes = await response.arrayBuffer();
    return new Uint8Array(bytes);
  }

  return {
    getProverKey: (circuitId: string) => readArtifact(".prover", circuitId),
    getVerifierKey: (circuitId: string) => readArtifact(".verifier", circuitId),
    getZKIR: (circuitId: string) => readArtifact(".bzkir", circuitId),
    getVerifierKeys: async (circuitIds: string[]) => Promise.all(circuitIds.map(async (circuitId) => [circuitId, await readArtifact(".verifier", circuitId)] as const)),
    get: async (circuitId: string) => ({
      circuitId,
      proverKey: await readArtifact(".prover", circuitId),
      verifierKey: await readArtifact(".verifier", circuitId),
      zkir: await readArtifact(".bzkir", circuitId),
    }),
  };
}

function toTransactionId(result: unknown, fallbackHex: string) {
  if (typeof result === "string" && result) return result;
  if (result && typeof result === "object") {
    const maybe = result as { transactionId?: string; id?: string };
    if (maybe.transactionId) return maybe.transactionId;
    if (maybe.id) return maybe.id;
  }
  return fallbackHex.slice(0, 64);
}

export type DeploySession = {
  api: ConnectedWallet;
  networkId: string;
  walletName?: string;
  walletAddress: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
  indexerUri: string;
  indexerWsUri: string;
  proofServerUri: string;
};

export async function connectWallet(): Promise<DeploySession> {
  const wallet = detectMidnightConnector();
  if (!wallet) {
    throw new Error("Midnight 1AM/Lace wallet not detected.");
  }

  const api = await wallet.connect(desiredMidnightNetwork());
  const [config, addresses] = await Promise.all([api.getConfiguration(), api.getShieldedAddresses()]);
  const networkId = config.networkId ?? desiredMidnightNetwork();
  await setBrowserNetworkId(networkId);

  return {
    api,
    networkId,
    walletName: wallet.name,
    walletAddress: addresses.shieldedAddress,
    coinPublicKey: addresses.shieldedCoinPublicKey,
    encryptionPublicKey: addresses.shieldedEncryptionPublicKey,
    indexerUri: config.indexerUri,
    indexerWsUri: config.indexerWsUri,
    proofServerUri: config.proverServerUri ?? "https://proof.preprod.midnight.network",
  };
}

export async function verifyCandidateOnPreprod(session: DeploySession, score: number) {
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new Error("Candidate score must be an integer from 0 to 100.");
  }

  await setBrowserNetworkId(session.networkId ?? desiredMidnightNetwork());

  const [
    { createUnprovenCallTxFromInitialStates, submitTxAsync, getPublicStates },
    { indexerPublicDataProvider },
    { CostModel, Transaction },
    compiledContract,
  ] = await Promise.all([
    import("@midnight-ntwrk/midnight-js-contracts"),
    import("@midnight-ntwrk/midnight-js-indexer-public-data-provider"),
    import("@midnight-ntwrk/ledger-v8"),
    buildCompiledContract(),
  ]);

  const { httpClientProofProvider } = await import("@midnight-ntwrk/midnight-js-http-client-proof-provider");
  const publicDataProvider = indexerPublicDataProvider(session.indexerUri, session.indexerWsUri);
  const publicStates = await getPublicStates(publicDataProvider, DEPLOYED_CONTRACT_ADDRESS as never);
  const zkConfigProvider = createFlatZkConfigProvider();
  const proofProvider = httpClientProofProvider(session.proofServerUri, zkConfigProvider);

  const walletProvider = {
    getCoinPublicKey: () => session.coinPublicKey,
    getEncryptionPublicKey: () => session.encryptionPublicKey,
    balanceTx: async (tx: { serialize(): Uint8Array }) => {
      const balanced = await session.api.balanceUnsealedTransaction(toHex(tx.serialize()));
      if (!balanced?.tx) throw new Error("balanceUnsealedTransaction returned no tx.");
      return Transaction.deserialize("signature", "proof", "binding", hexToBytes(balanced.tx));
    },
  };

  const providers = {
    zkConfigProvider,
    walletProvider,
    proofProvider,
    publicDataProvider,
    midnightProvider: {
      submitTx: async (tx: { serialize(): Uint8Array }) => {
        const result = await session.api.submitTransaction(toHex(tx.serialize()));
        return toTransactionId(result, toHex(tx.serialize()));
      },
    },
  };

  const callTxData = await (createUnprovenCallTxFromInitialStates as any)(zkConfigProvider, {
    compiledContract,
    circuitId: "verifyCandidate",
    contractAddress: DEPLOYED_CONTRACT_ADDRESS,
    args: [score],
    coinPublicKey: session.coinPublicKey,
    initialContractState: publicStates.contractState,
    initialZswapChainState: publicStates.zswapChainState,
    ledgerParameters: publicStates.ledgerParameters,
    initialPrivateState: {},
  }, session.encryptionPublicKey);

  const transactionId = await submitTxAsync(providers as never, {
    unprovenTx: callTxData.private.unprovenTx,
    circuitId: "verifyCandidate",
  });

  return { transactionId, contractAddress: DEPLOYED_CONTRACT_ADDRESS };
}

export async function disconnectWallet(session: DeploySession) {
  const candidate = session.api as ConnectedWallet & { close?: () => Promise<void> | void };
  if (typeof candidate.disconnect === "function") {
    await candidate.disconnect();
  } else if (typeof candidate.close === "function") {
    await candidate.close();
  }
}
