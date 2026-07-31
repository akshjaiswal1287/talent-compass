# TalentCompass

TalentCompass is a private technical-screening MVP. It redacts direct identifiers before submitting resume text to its scoring provider, then lets a connected Midnight wallet call `verifyCandidate` on the configured Preprod contract.

## Product idea

Recruiters need evidence of technical fit without collecting more personal information than necessary. TalentCompass separates identity from merit: candidate text is redacted before automated scoring, while Midnight proves that a score meets a threshold without putting raw resume content in the circuit call.

Proposal record: [docs/product-proposal.md](docs/product-proposal.md). Approval is pending; no approval is claimed.

## Live network configuration

- Network: Midnight Preprod
- Configured contract address: `5e0775b3e657dff1f249bd92d5f8f92971c03172a46918fa7e003518955d7998`
- Explorer: [Midnight Preprod Explorer](https://preprod.midnightexplorer.com/)
- Circuit: `verifyCandidate`

The address is configured in [`client/src/lib/midnight/contract.ts`](client/src/lib/midnight/contract.ts). It has not been independently verified from this checkout: the explorer contract URL returned 404 on 2026-07-28. Do not treat this README as deployment proof until a direct explorer address/transaction link is recorded.

No public demo URL, public Git remote, or product X profile is configured in this checkout. Those external records are intentionally not invented.

## Privacy model

### What stays private

- Raw resume text is never sent to Midnight or placed in a circuit argument.
- Before Gemini receives text, server-side redaction replaces email addresses, phone numbers, links, and labelled name/address/location fields. Tests assert this boundary.
- Wallet address is held only in browser memory for a connected session and cleared by **Disconnect wallet**.

### What an observer can learn

Current deployed circuit source stores `verifiedScore = disclose(aiScore)`. An on-chain observer can therefore learn submitted score and whether its call met `aiScore >= 70`; they cannot learn the raw resume from this circuit call.

This is an important limitation, not a claim of score privacy. A score-hiding revision requires a newly compiled and deployed Preprod contract (for example, public `eligible: Boolean` rather than disclosed score), followed by updating the configured address and recording its explorer link.

## Wallet and proof flow

1. Start app and connect Lace or 1AM on Midnight Preprod.
2. Paste resume text and choose **Analyze resume**.
3. Server redacts direct identifiers before external scoring.
4. Choose **Publish proof**. Browser loads checked-in ZK keys, reads current public state, creates proof transaction, asks wallet to balance/sign/submit it, then shows returned transaction ID.
5. Choose **Disconnect wallet** to clear browser-held session state.

The proof call is a real browser integration in [`client/src/lib/midnight/browser-deploy.ts`](client/src/lib/midnight/browser-deploy.ts); it is not simulated. A successful live call still requires a funded compatible wallet, reachable Preprod services, and a verifiable deployed contract.

## Local setup

Requirements: Node.js 22+, npm, Lace or 1AM for live proof submission, and a `GEMINI_API_KEY` for scoring.

```powershell
cd server
npm ci
$env:GEMINI_API_KEY = "your-key"
node server.js
```

In another terminal:

```powershell
cd client
npm ci
npm run dev
```

Vite proxies `/api` to `http://localhost:5000`. For a hosted API set `VITE_API_URL` to its HTTPS base URL.

## Verification commands

```powershell
cd server
npm test

cd ../client
npm run lint
npm run build
```

`server` has three real privacy-boundary tests. `client` build synchronizes browser assets from checked-in contract artifacts. Generated managed artifacts and hashes are documented in [`contract/managed/talentcompass-guard`](contract/managed/talentcompass-guard/README.md).

## CI

GitHub Actions workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml). It installs locked dependencies, lints/builds client, then runs server tests. This repository has no Git remote, so no hosted Actions run or badge can truthfully be linked yet.

## Checklist evidence status

- Contract source, compiled bundle, ZKIR, keys: tracked under `contract/` and `contract/managed/talentcompass-guard/`.
- Tests: `server/test/privacy.test.js` (3 tests).
- Wallet connect/disconnect: implemented in browser UI.
- Frontend circuit call: implemented through wallet balance, proof, and submit APIs.
- Product proposal: drafted, approval pending.
- Video: not supplied.

External deployment verification, public demo/repository, hosted CI passing run, approval receipt, and X profile require existing service/account ownership and are not claimed by this checkout.
