# Public kalendar PDF release review — HOLD MERGE

This branch prepares public, non-personalized kalendar pages for parent review. Do not merge, enable auto-merge, or deploy until root PR remote checks are green and the parent explicitly confirms promotion. Ready renderer status is not release authorization.

Parent confirmation received 2026-11-08: all 56 PDFs passed SHA256, size, actual Letter/one-page parsing, day-anchor totals 365/365/366/365, and actual copyPages assembly (approximately 7.4 MB per year). This is parent-reported PDF validation, in addition to the direct asset integrity checks below. This confirmation also applies to the new checkpoint-regenerated sets, as confirmed by the parent after replacement. Root remote checks and explicit parent promotion remain pending.

Card rendering correctly stopped on Card 2 overflow. No card files or incomplete card manifests are included; no fit constraints were changed. No `diagnostic-assembled-year.pdf` was copied.

## Canonical CDN-relative paths

Each directory contains unchanged `manifest.json` and `month-01.pdf` through `month-14.pdf`:

| Year | Directory | Manifest SHA256 |
| --- | --- | --- |
| 5003 | `kalendar-pages/5003/b2e84e6fa59c2068fad1b253aa98421c0b85f760370d5412e824c8e569e6e71c/` | `d0fc796ed8ea193427084966318cd05d0e37b3842376720f6b677597e00520bc` |
| 5004 | `kalendar-pages/5004/4273388338f867fdbf45fb4f11d2ed9408fdb069f2dc187dc94ee94f2315ea68/` | `2acb7a928b0217b1930fb8a690b54c104e5bb014b4879c1b6550ced6e1deb958` |
| 5005 | `kalendar-pages/5005/cd6330c7d61f5e5942b8ad4ea744027dbb96e1fe9b20d27bc6c5a86b4155573e/` | `030d2f6751c3ff7ef0b477876cd9aab48f27590f6e153dfbdd309e0952d09ffd` |
| 5006 | `kalendar-pages/5006/aeee757b38a3c42bff4096787e65141baab9daf533e23dd8bb34b0b7642cfa0d/` | `b7935efbf33b2cc75bbe0261c14fc6f1f678bcc4e8bb1e9729ab908f0df59414` |

After authorized publication, prefix paths with `https://igbokal.github.io/Igbo-Kal-Assets/`. Manifest file paths are relative to the CDN root, NOT relative to the manifest URL. Do not append file paths to the nested manifest directory.

## Completed asset integrity checks

- 56 unchanged PDF payloads, total 30,877,755 bytes; each matches its manifest SHA256 and byte size and has a PDF signature. No file exceeds 25 MB.
- Four unchanged manifests, 14 unique canonical periods each (indices 0–13); months 01–13 have 28 day anchors each.
- Threshold 14 has one anchor for 5003/5004/5006, two for 5005; totals 365/365/366/365. Manifest geometry is Letter 612×792, one page; actual PDF parsing/assembly is the separate parent gate.
- All five manifest font faces match the packaged licensed payloads, SHA256, source URLs/revision, weight ranges, MIME/format, OFL and metadata hashes. All 11 upstream font/license/metadata files verified byte-for-byte.
- Only explicitly listed public PDFs and their manifests were copied. No directory-wide copying, private names/notes, assembled personal PDFs, or diagnostic outputs. No artwork/spelling changes. No images loaded.
- Local font paths in the unchanged manifests remain build-provenance references, not CDN license URLs. Public licenses are `assets/fonts/<family-slug>/ofl.txt`; exact mappings and hashes are in `assets/fonts/font-provenance.json`.

Run from this independent Assets checkout:

```powershell
node scripts/verify-public-kalendar-exports.mjs
node scripts/prepare-export-fonts.mjs
```

The first command validates locally without network. The second re-fetches only immutable official public Google Fonts upstream URLs and validates licensed, unmodified TTF payloads.

## Checkpoint regeneration and remaining release gate

The parent regenerated all four sets from committed source checkpoint `009e10035fdd98f9eef677cb3ca7dc16feb28505`. This update imports those genuine new renderer manifests and manifest-listed files byte-for-byte; it does not rewrite sourceRevision. The prior four draft-only sets were removed by exact tracked-file allowlist after verifying they did not exist at the Assets base commit. Their original Foundation files and prior Git history remain intact. Fonts/licenses are unchanged.

Parent confirms the newly regenerated 56 PDFs pass SHA256, byte sizes, actual Letter/one-page parsing, anchors 365/365/366/365, and actual copyPages assembly. Parent also confirms this checkpoint contains the exact rendering code. This is parent validation evidence, distinct from this branch's direct destination hash/contract tests.

The renderer hashes the actual built bundle and pipeline into renderHash. Separate bundleHash/pipelineHash fields are still not exposed in these schema-v1 manifests; no fabricated build evidence has been added.

**HOLD MERGE:** root PR remote checks must be green and the parent must explicitly confirm promotion. Do not enable auto-merge or deploy in advance. Exact API rendering remains disabled by default and is not production-enabled. Card 2 overflow remains fail-closed; there are no card artifacts or diagnostic assemblies in this release.
