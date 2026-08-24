# Native Page 1 PNG baselines — provenance

Authority: owner ruling 2026-08-23 #5 — native PNG baselines approved, **exact to
Figma**, max-depth (full-file) pull mandatory. These six renders close the
standing evidence blocker recorded in `docs/overhaul/c2-51-node-ledger.md`
("native-width Figma PNG baselines absent for `102:81`, `102:560`, `226:898`,
`102:16`, `157:126`, `223:173`").

These are pixel-fidelity evidence for the six implemented-local-not-accepted
Page-1 mobile nodes. Presence here is **not** visual acceptance.

## Capture method (2026-08-24, `scripts/fleet/capture-page1-native-baselines.mjs`)

1. Canonical **untruncated full-file pull** `GET /v1/files/TTNkBhwPq88j9wRgrGOCAt`
   — file version `2388014748743450779`, Page 1 census 5,335 walked nodes
   (5,334 + the page node itself; same convention difference the inventory
   records). Every target node confirmed present on Page 1.
2. Local sizes from `GET /v1/files/<KEY>/nodes?ids=…&geometry=paths` — the
   local `size` field. `absoluteBoundingBox` was never used.
3. Native-width renders `GET /v1/images/<KEY>?ids=…&format=png&scale=1`.
4. PNG IHDR dimensions verified equal to the local size before any write.

## Register

| Node | Frame | PNG | Dimensions | Bytes | SHA-256 |
|---|---|---|---:|---:|---|
| `102:16` | igbokal-mobile | `102-16.png` | 402×908 | 73,875 | `2d2752389d5933e9eeba1c4f47703a36a02cfd3f4e017e6f1f6eda336450530c` |
| `102:81` | igbokal-mobile cal | `102-81.png` | 402×1138 | 119,946 | `096aeeb5c4b76a9117923126acefae5bf53723f62cf411d128e72536bd028f4d` |
| `102:560` | Reflection-modal | `102-560.png` | 402×616 | 39,945 | `d082c2772a271fd8e8ad146a161d4a303f0270b59c127dd21d176289d24e061a` |
| `226:898` | Month-modal | `226-898.png` | 402×662 | 73,002 | `555bd2550a93de13d3501adb810a17b0379b4e44d5c3d0334235b141bfc124bd` |
| `157:126` | login-screen | `157-126.png` | 402×874 | 23,123 | `fd061e34afb6179cd97bcbc72e57fc55779809dccddd10720b68196d49b5af7a` |
| `223:173` | glossary-page | `223-173.png` | 402×2983 | 241,659 | `7c84d0739826b9fd38402a0acd0322c85ad5f4a24a3f42c4fa1d06f921bf96f1` |

## Independent cross-checks

Three of the six reproduce prior captures **byte-for-byte**:

- `102-16.png` = the 2026-08-22 native specimen encoded SHA-256 recorded in
  `docs/overhaul/FIGMA-FIDELITY-BASELINES.md` (`2d275238…`).
- `157-126.png` = the 2026-08-23 login specimen (`fd061e34…`).
- `223-173.png` = the R2 public-glossary candidate export (`7c84d073…`,
  241,659 bytes).

`102-81`, `102-560`, and `226-898` are the first governed captures for those
nodes; no prior baseline existed anywhere.

The same files remain the raster inputs for `e2e/svg-fidelity.spec.ts` through
the gitignored `docs/reference/figma/` mirror; this corpus copy is the governed
canonical source of those bytes.
