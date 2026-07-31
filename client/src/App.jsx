import { useMemo, useState } from "react";
import "./App.css";
import { DEPLOYED_CONTRACT_ADDRESS } from "./lib/midnight/contract";

const exampleResume = `Senior product engineer with 8 years of experience building accessible web apps, internal tools, and AI-assisted workflows. Led a 4-person frontend team, improved conversion by 18%, and shipped design systems used across three products. Strong background in React, TypeScript, Node.js, API design, analytics, and stakeholder collaboration.`;
const apiUrl = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [resumeText, setResumeText] = useState(exampleResume);
  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Connect wallet to publish a proof to deployed Preprod contract.");
  const [txHash, setTxHash] = useState("");

  const completion = useMemo(() => (result ? Math.min(100, Math.max(0, result.score)) : 0), [result]);

  async function connectWallet() {
    setStatus("Connecting Lace or 1AM wallet...");
    try {
      const { connectWallet: connect } = await import("./lib/midnight/browser-deploy");
      const next = await connect();
      setSession(next);
      setStatus(`Connected to ${next.walletName ?? "Midnight wallet"} on ${next.networkId}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }

  async function disconnectWallet() {
    if (!session) return;
    setLoading(true);
    try {
      const { disconnectWallet: disconnect } = await import("./lib/midnight/browser-deploy");
      await disconnect(session);
      setSession(null);
      setTxHash("");
      setStatus("Wallet disconnected. No wallet address is retained by TalentCompass.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet disconnect failed.");
    } finally {
      setLoading(false);
    }
  }

  async function screenResume() {
    if (!resumeText.trim()) return setStatus("Paste resume text first.");
    setLoading(true);
    setResult(null);
    setTxHash("");
    setStatus("Analyzing resume...");
    try {
      const response = await fetch(`${apiUrl}/api/screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Resume analysis failed.");
      setResult(data);
      setStatus("Screening complete. Connect wallet to publish proof.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function publishProof() {
    if (!session || !result) return;
    setLoading(true);
    setStatus(`Generating proof for score ${result.score} on deployed contract...`);
    try {
      const { verifyCandidateOnPreprod } = await import("./lib/midnight/browser-deploy");
      const published = await verifyCandidateOnPreprod(session, result.score);
      setTxHash(published.transactionId);
      setStatus("Proof transaction submitted to Midnight Preprod.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Proof submission failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Private hiring workspace · Midnight Preprod</span>
          <h1>TalentCompass</h1>
          <p className="hero-text">Screen resumes without identity noise, then request a proof call against configured Midnight Preprod contract.</p>
          <div className="action-row">
            {session ? <button className="ghost-button" onClick={disconnectWallet} disabled={loading}>Disconnect wallet</button> : <button className="primary-button" onClick={connectWallet} disabled={loading}>Connect Lace / 1AM</button>}
            <span className="muted-chip">No local deployment</span>
          </div>
        </div>
        <aside className="hero-panel">
          <div className="stat-card"><span>Network</span><strong>Midnight Preprod</strong></div>
          <div className="stat-card"><span>Contract</span><strong>Fixed deployed address</strong></div>
          <div className="stat-card"><span>Proof circuit</span><strong>verifyCandidate</strong></div>
        </aside>
      </section>

      <section className="workspace-grid main-grid">
        <article className="surface">
          <div className="surface-heading"><div><span className="section-label">Resume input</span><h2>Paste candidate text</h2></div><button className="ghost-button" onClick={() => setResumeText(exampleResume)}>Load sample</button></div>
          <textarea className="resume-input" rows="12" value={resumeText} onChange={(event) => setResumeText(event.target.value)} />
          <div className="action-row"><button className="primary-button" onClick={screenResume} disabled={loading}>{loading ? "Working..." : "Analyze resume"}</button><p className="helper-text">Names, email, phone, and address excluded from AI output.</p></div>
        </article>

        <article className="surface">
          <div className="surface-heading"><div><span className="section-label">Results</span><h2>Screening snapshot</h2></div><span className="muted-chip">{result ? "Updated" : "Waiting"}</span></div>
          {result ? <>
            <div className="score-display"><div><span>Merit score</span><strong>{result.score} / 100</strong></div><div><span>Experience</span><strong>{result.experience_years} yrs</strong></div></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
            <div className="proof-box"><h3>Privacy anchor</h3><p>Submit score to configured contract without exposing raw resume text.</p><button className="secondary-button" onClick={publishProof} disabled={!session || loading}>{session ? "Publish proof" : "Connect wallet first"}</button></div>
            {txHash ? <div className="hash-card"><span>Public transaction ID</span><code>{txHash}</code></div> : null}
          </> : <div className="empty-state"><p>Run screening to populate score and proof controls.</p></div>}
          <p className="status-text" role="status">{status}</p>
        </article>
      </section>

      <section className="surface contract-banner"><span className="section-label">Connected contract</span><code>{DEPLOYED_CONTRACT_ADDRESS}</code></section>
    </main>
  );
}
