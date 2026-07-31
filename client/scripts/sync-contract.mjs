import { access, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(clientRoot, "..");
const sourceContract = path.join(repoRoot, "contract");
const clientContract = path.join(clientRoot, "src", "contracts", "talentcompass-guard");
const clientAssets = path.join(clientRoot, "public", "midnight-assets", "talentcompass-guard");

try {
  await access(sourceContract);
} catch {
  console.log("Contract source unavailable; using checked-in client artifacts.");
  process.exit(0);
}

async function syncTree(srcDir, destDir, entries) {
  await rm(destDir, { recursive: true, force: true });
  await mkdir(destDir, { recursive: true });
  for (const entry of entries) {
    await cp(path.join(srcDir, entry), path.join(destDir, entry), { recursive: true });
  }
}

await syncTree(path.join(sourceContract, "contract"), clientContract, ["index.js", "index.d.ts", "index.js.map"]);
await syncTree(path.join(sourceContract, "compiler"), clientAssets, ["contract-info.json"]);
await cp(path.join(sourceContract, "zkir", "verifyCandidate.bzkir"), path.join(clientAssets, "verifyCandidate.bzkir"));
await cp(path.join(sourceContract, "zkir", "verifyCandidate.zkir"), path.join(clientAssets, "verifyCandidate.zkir"));
await cp(path.join(sourceContract, "keys", "verifyCandidate.prover"), path.join(clientAssets, "verifyCandidate.prover"));
await cp(path.join(sourceContract, "keys", "verifyCandidate.verifier"), path.join(clientAssets, "verifyCandidate.verifier"));
