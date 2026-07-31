# Managed contract artifacts

This directory is a checked-in managed copy of artifacts generated for `talentcompass_guard.compact` with Compact compiler `0.30.0`, language `0.22.0`, and runtime `0.16.0`.

It contains the compiled contract bundle, compiler metadata, ZKIR, and prover/verifier keys required by the browser proof flow. Hashes of source artifacts at creation:

| File | SHA-256 |
| --- | --- |
| `talentcompass_guard.compact` | `579916D85BC38AFC3B15DCE3A58A5FC8160DB96B807BFC5A2E277EC4874346B3` |
| `compiler/contract-info.json` | `138CCE6436FCDD23FB74F00D2BB73F38D459EE3377DA26032F8CC892135D46B6` |
| `contract/index.js` | `BA8571369C1DDE011E522BE86C69C6D8FACF8060A45A8FF5F6D6BF7A137EE2D0` |
| `keys/verifyCandidate.prover` | `E9C5ADFB41A9DDCEE702951BFA5CCD712F02CA5CF37A10A9F8E2305EB4D5CAD6` |
| `keys/verifyCandidate.verifier` | `1B2DBFFFBC64FC01853C57AF49D0E0C7183CA1EB08D4F31552E2FE0EA1882009` |
| `zkir/verifyCandidate.zkir` | `E2A74FE88B1F1BDA036C77BE62DF6878E15BC650C427CF1A6C288B409EF832ED` |
| `zkir/verifyCandidate.bzkir` | `A0093483DB97F682EA2E909BE565187B139F1BC568A1EDDEC0A14750D03A511E` |

Run `npm run build` in `client/` to copy active artifacts into browser-served paths. Recompile with a verified Compact toolchain before changing the Compact source; do not hand-edit generated files.
