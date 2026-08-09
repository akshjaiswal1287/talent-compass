import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { DEPLOYED_CONTRACT_ADDRESS } from "./lib/midnight/contract";
import { ACTIVE_CONTRACT_EVENT, getActiveContractAddress } from "./lib/midnight/browser-deploy";

const exampleResume = `Senior product engineer with 8 years of experience building accessible web apps, internal tools, and AI-assisted workflows. Led a 4-person frontend team, improved conversion by 18%, and shipped design systems used across three products. Strong background in React, TypeScript, Node.js, API design, analytics, and stakeholder collaboration.`;
const apiUrl = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [activeContractAddress, setActiveContractAddress] = useState(DEPLOYED_CONTRACT_ADDRESS);
  const [resumeText, setResumeText] = useState(exampleResume);
  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageMode, setPageMode] = useState("landing");
  const [status, setStatus] = useState("Deploy and verify the TalentCompass contract before publishing a proof.");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    const syncActiveContract = () => setActiveContractAddress(getActiveContractAddress());
    syncActiveContract();
    window.addEventListener(ACTIVE_CONTRACT_EVENT, syncActiveContract);
    window.addEventListener("storage", syncActiveContract);
    return () => {
      window.removeEventListener(ACTIVE_CONTRACT_EVENT, syncActiveContract);
      window.removeEventListener("storage", syncActiveContract);
    };
  }, []);

  const completion = useMemo(() => (result ? Math.min(100, Math.max(0, result.score)) : 0), [result]);

  if (pageMode === "landing") {
    return (
      <main className="product-site">
        <nav className="site-nav">
          <button className="brand-lockup" onClick={() => setPageMode("landing")}>
            <span className="brand-mark">TC</span>
            <span><strong>TalentCompass</strong><small>Private hiring intelligence</small></span>
          </button>
          <div className="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#privacy">Privacy</a>
            <a href="/deploy">Deploy</a>
          </div>
          <button className="primary-button nav-cta" onClick={() => setPageMode("workspace")}>Open workspace <span>↗</span></button>
        </nav>

        <section className="landing-hero">
          <div className="landing-copy">
            <span className="eyebrow">A quieter signal for better hiring</span>
            <h1>Find the evidence behind a candidate, not the noise around them.</h1>
            <p>TalentCompass helps teams screen resumes with identity details set aside, then publish a compact Midnight proof without exposing the source document.</p>
            <div className="landing-actions">
              <button className="primary-button" onClick={() => setPageMode("workspace")}>Start a private review <span>→</span></button>
              <a className="text-link" href="#how-it-works">See the workflow <span>↓</span></a>
            </div>
            <div className="landing-note"><span className="pulse-dot" /> Preprod proof surface ready <span className="note-divider" /> 1AM compatible</div>
          </div>
          <div className="signal-board" aria-label="TalentCompass workflow preview">
            <div className="board-top"><span>Screening room / 01</span><span className="board-live">LIVE PREVIEW</span></div>
            <div className="candidate-row"><div className="avatar-block">SP</div><div><strong>Senior product engineer</strong><p>8 years · Product systems · Frontend</p></div><span className="score-badge">92</span></div>
            <div className="score-line"><span>Merit signal</span><div><i style={{width: "92%"}} /></div><b>92 / 100</b></div>
            <div className="board-grid"><div><span>Raw identity</span><strong>Excluded</strong></div><div><span>Public anchor</span><strong>Private proof</strong></div></div>
            <div className="board-footer"><span className="shield-mini">◇</span> Resume text remains outside the ledger <span>↗</span></div>
          </div>
        </section>

        <section className="landing-strip" id="how-it-works">
          <div><span className="section-label">The operating model</span><h2>Useful before it is impressive.</h2></div>
          <p>From raw resume to reviewable decision in three deliberate moves. No identity theater, no black-box score dump.</p>
        </section>
        <section className="landing-steps">
          {[["01", "Screen locally", "Analyze experience and merit signals while names, contact details, and addresses stay out of the output."], ["02", "Review with context", "Give a hiring team a legible snapshot instead of a pile of generated claims."], ["03", "Anchor privately", "Submit only the proof call to Midnight Preprod when the team is ready to verify the signal."]].map(([num, title, body]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{body}</p><div className="step-arrow">↗</div></article>)}
        </section>
        <section className="privacy-callout" id="privacy"><div><span className="section-label">Designed for restraint</span><h2>Privacy is part of the hiring workflow, not a footnote.</h2></div><div className="privacy-points"><p><b>01</b>Identity fields stay outside the AI screening response.</p><p><b>02</b>The contract receives the score proof, never the resume body.</p><p><b>03</b>1AM handles approval when your team chooses to publish.</p></div></section>
        <footer className="site-footer"><span>TalentCompass / Midnight Preprod</span><button onClick={() => setPageMode("workspace")}>Open screening room →</button></footer>
      </main>
    );
  }

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
      setStatus(`Generating proof for score ${result.score} on verified Preprod contract...`);
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
      <nav className="workspace-nav"><button className="brand-lockup" onClick={() => setPageMode("landing")}><span className="brand-mark">TC</span><span><strong>TalentCompass</strong><small>Private hiring intelligence</small></span></button><div className="nav-links"><button onClick={() => setPageMode("landing")}>Overview</button><a href="/deploy">Deploy</a></div><span className="muted-chip">Midnight Preprod</span></nav>
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
          <div className="stat-card"><span>Contract mode</span><strong>Active browser deployment</strong></div>
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
            <div className="proof-box"><h3>Privacy anchor</h3><p>Submit score to the verified contract without exposing raw resume text.</p><button className="secondary-button" onClick={publishProof} disabled={!session || loading || !activeContractAddress}>{!activeContractAddress ? "Deploy contract first" : session ? "Publish proof" : "Connect wallet first"}</button></div>
            {txHash ? <div className="hash-card"><span>Public transaction ID</span><code>{txHash}</code></div> : null}
          </> : <div className="empty-state"><p>Run screening to populate score and proof controls.</p></div>}
          <p className="status-text" role="status">{status}</p>
        </article>
      </section>

      <section className="surface contract-banner"><span className="section-label">Active Preprod contract</span><code>{activeContractAddress || "None verified. Deploy at /deploy."}</code></section>
    </main>
  );
}
