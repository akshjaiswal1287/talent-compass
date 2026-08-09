import { useState } from 'react';
import { connectWallet, deployTalentCompass } from './lib/midnight/browser-deploy';
import { DEPLOYED_CONTRACT_ADDRESS } from './lib/midnight/contract';

export default function DeployPage() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('Connect 1AM on Midnight Preprod to continue.');
  const [txHash, setTxHash] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [deploying, setDeploying] = useState(false);

  async function connect() {
    try {
      const next = await connectWallet();
      setSession(next);
      setStatus('Wallet connected. Ready for Preprod proof deployment.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Wallet connection failed.');
    }
  }

  async function deploy() {
    if (!session) return setStatus('Connect 1AM first.');
    setDeploying(true);
    setTxHash('');
    setContractAddress('');
    setStatus('Compiling, proving, balancing, and waiting for Preprod finalization...');
    try {
      const result = await deployTalentCompass(session);
      setTxHash(result.transactionHash);
      setContractAddress(result.contractAddress);
      setStatus('Fresh TalentCompass contract deployed and verified on Midnight Preprod.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Deployment failed.');
    } finally {
      setDeploying(false);
    }
  }

  return <main className="app-shell deploy-shell">
    <section className="surface deploy-card">
      <span className="section-label">TalentCompass / browser deploy</span>
      <h1>Deploy hiring proof</h1>
      <p className="hero-text">Connect 1AM, compile the current TalentCompass contract bundle, and submit a real proof transaction to Midnight Preprod.</p>
      <div className="action-row">
        <button className="primary-button" onClick={connect}>{session ? '1AM connected' : 'Connect 1AM'}</button>
        <button className="secondary-button" onClick={deploy} disabled={!session || deploying}>{deploying ? 'Waiting for Preprod...' : 'Deploy proof'}</button>
      </div>
      <p className="status-text" role="status">{status}</p>
      {txHash ? <div className="hash-card"><span>Finalized deployment transaction hash</span><code>{txHash}</code><small>This is the included on-chain transaction hash for explorer lookup.</small></div> : null}
      {contractAddress ? <div className="hash-card"><span>Active Preprod contract address</span><code>{contractAddress}</code><small>This address has public contract state and is active for TalentCompass proof calls in this browser.</small></div> : null}
      {!contractAddress ? <div className="hash-card"><span>Configured Preprod contract</span><code>{DEPLOYED_CONTRACT_ADDRESS || 'No verified contract configured'}</code><small>This is the canonical TalentCompass contract used by proof calls.</small></div> : null}
    </section>
  </main>;
}
