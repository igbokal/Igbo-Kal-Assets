# Approved-family export font payloads

Prepared for an Assets draft PR together with the public 5003–5006 PDF manifests. This is not CDN publication or wordmark/design approval. Parent coordinates merge authorization and Agent-QA release validation; see [release hold](../../kalendar-pages/release-review.md).

## Source and license

All font, OFL, and METADATA bytes were downloaded unchanged from the official public `google/fonts` repository at commit `5bb28733cec313b63fbd415b574b5ae35c8aa8b8`. No conversion, subsetting, or dependency installation. Only local filenames changed. Each family directory contains the byte-identical upstream `ofl.txt` and `metadata.pb`. `font-provenance.json` records complete source URLs, SHA256, byte sizes, embedded version, copyright, axes, license and metadata hashes. Upstream METADATA also preserves designer-source commit information.

Embedded copyright notices match upstream OFL authors and reserved names. Ribeye's OFL covers both Ribeye and Ribeye Marrow, while the supplied Ribeye font's embedded notice names only Ribeye. OFLs are not rewritten. All three licenses are SIL OFL 1.1. Retain these license/provenance files with redistribution. These fonts are not being sold by themselves.

## Faces

- Work Sans Version 2.012: normal and italic variable TrueType, actual `wght` 100–900; covers requested 400/600/700 in both styles.
- EB Garamond Version 1.003: normal and italic variable TrueType, actual `wght` 400–800; covers regular/italic 400 and bold 700.
- Ribeye Version 1.000: normal TrueType 400.

Maximum font size is 851176 bytes (under 25 MB). No images were loaded, and no artwork or Igbo spellings were modified.

## Reproduce and validate

From this Assets repository:

```powershell
node scripts/prepare-export-fonts.mjs
```

Requires existing Node with built-in fetch and network access only to the pinned public GitHub raw URLs. Existing payloads must match exactly; mismatched existing files are not overwritten. Validates sfnt signatures, tables, embedded names/styles/versions/OFL, true weight axes, upstream metadata, copyright/license coverage and SHA256.

Local verification on 2026-11-08: all five payloads loaded in Chromium 145.0.7632.6 using `FontFace`, `data:font/ttf;base64,...` and `format('truetype')`, with every browser network request denied. Eleven family/style/weight loads passed (Work Sans 400/600/700 both styles, EB Garamond 400/700 both styles, Ribeye 400). This is font integrity/loading evidence, not exact-layout export approval.

## Parent renderer handoff

The isolated Assets checkout is inside the renderer's ignored `card-exports/assets-fonts/` directory, on branch `assets/nov8-approved-export-fonts`, based on Assets `7370fbf7339719e9725c99da86376ca19073082b`. It has its own `.git`; no fonts are PWA-tracked. This does not repair or alter the broken root Assets submodule Git metadata.

Renderer inventory: `card-exports/approved-fonts.json`, with local renderer-relative paths and actual hashes plus full provenance fields. Renderer README confirms font families were already approved. Requested Nov1D31 was not found by filename/content search in root or renderer docs; this preparation does not invent a new design approval.

Initial renderer handoff required replacing hardcoded `data:font/woff2` handling with validated TrueType `data:font/ttf` / `format('truetype')` support. Parent subsequently supplied ready Foundation renders using these fonts; see the release hold for their preserved manifests. This asset task does not modify renderer-owned code. In a checkout with the parent's TTF integration:

```powershell
npm run render:artifacts -- --kind=month --year=5004 --fonts=card-exports/approved-fonts.json
npm run render:artifacts -- --kind=card --manifest=card-exports/public-manifest.json --snapshot=card-exports/snapshot.json --fonts=card-exports/approved-fonts.json
```

Card command additionally needs valid released manifest/snapshot inputs. No actual artifact export or layout approval is claimed here.

## Proposed stable CDN paths — NOT published

Base: `https://igbokal.github.io/Igbo-Kal-Assets/`

- `assets/fonts/work-sans/work-sans-regular-variable.ttf`
- `assets/fonts/work-sans/work-sans-italic-variable.ttf`
- `assets/fonts/eb-garamond/eb-garamond-regular-variable.ttf`
- `assets/fonts/eb-garamond/eb-garamond-italic-variable.ttf`
- `assets/fonts/ribeye/ribeye-regular.ttf`

Parent must explicitly stage/release only after all-file verification and Agent-QA handoff; this preparation does not enable CDN publication.
