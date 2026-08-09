# Managed contract artifacts

This directory is a checked-in managed copy of artifacts generated for `talentcompass_guard.compact` with Compact compiler `0.30.0`, language `0.22.0`, and runtime `0.15.0`.

It contains the compiled contract bundle, compiler metadata, ZKIR, and prover/verifier keys required by the browser proof flow. Hashes of source artifacts at creation:

| File | SHA-256 |
| --- | --- |
| `talentcompass_guard.compact` | `579916D85BC38AFC3B15DCE3A58A5FC8160DB96B807BFC5A2E277EC4874346B3` |
| `compiler/contract-info.json` | `BBCFCA2DEA403065D386DC86D7CD49790FBE55EBD1F2C8094392D0ACFFCA0566` |
| `contract/index.js` | `BE5016680C5DFD2B3DCC4DC99932CE2CBDCBC7803DA6A20066EE33F1AA8157E6` |
| `keys/verifyCandidate.prover` | `E9C5ADFB41A9DDCEE702951BFA5CCD712F02CA5CF37A10A9F8E2305EB4D5CAD6` |
| `keys/verifyCandidate.verifier` | `1B2DBFFFBC64FC01853C57AF49D0E0C7183CA1EB08D4F31552E2FE0EA1882009` |
| `zkir/verifyCandidate.zkir` | `B423315476641EDED8DF3AF58CFF80D7FEB876C016068C75C26C644003DD47F1` |
| `zkir/verifyCandidate.bzkir` | `A0093483DB97F682EA2E909BE565187B139F1BC568A1EDDEC0A14750D03A511E` |

Run `npm run build` in `client/` to copy active artifacts into browser-served paths. Recompile with a verified Compact toolchain before changing the Compact source; do not hand-edit generated files.
