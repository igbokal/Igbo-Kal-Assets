# Public kalendar PDF release review — HOLD MERGE

This branch prepares public, non-personalized kalendar pages for parent review. Do not merge, enable auto-merge, or deploy until the parent resolves the source-binding checkpoint below. Ready renderer status is not release authorization.

Parent confirmation received 2026-11-08: all 56 PDFs passed SHA256, size, actual Letter/one-page parsing, day-anchor totals 365/365/366/365, and actual copyPages assembly (approximately 7.4 MB per year). This is parent-reported PDF validation, in addition to the direct asset integrity checks below. Root source checkpoint is still pending before promotion.

Card rendering correctly stopped on Card 2 overflow. No card files or incomplete card manifests are included; no fit constraints were changed. No `diagnostic-assembled-year.pdf` was copied.

## Canonical CDN-relative paths

Each directory contains unchanged `manifest.json` and `month-01.pdf` through `month-14.pdf`:

| Year | Directory | Manifest SHA256 |
| --- | --- | --- |
| 5003 | `kalendar-pages/5003/dd20aa3d5b9199d2ce681fbb73d8e266560dffd6189a103e549ca655129ebe0d/` | `4cadb02be8db5f9600e8fff5d424e529c166950c74ad769a8645f549f7678565` |
| 5004 | `kalendar-pages/5004/1d37e6424442545cd1f5fe9528b06974fa4a2b5a27596f8d06f612a5e3c2dbe3/` | `fa6c71131f09da122be2238e8319806a4de04eab901dbf5d3a84ceee58ca47d2` |
| 5005 | `kalendar-pages/5005/fdb2a075c2b99b796ab8ad163da874119791cc7235e20b23dbb7dbc96a419ddb/` | `35c3f35cd415992b5276c6bbf01a5006a310534aaa40cb5c46daef3c26963436` |
| 5006 | `kalendar-pages/5006/2aa5fabe22de45334aea39f81d6abe0701722d2bea1867ee12cda2fd7c6db98d/` | `3d4c05415f8fbe32240e803a8761f33e9234f6cf9b013954b7aeb47589b7ee95` |

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

## Source-revision binding issue — parent decision required

All manifests identify `sourceRevision: 767923db82405dc9b9363240abcdcea5e6901eba`. Parent reports the renderer was run with dirty portal code. Inspection of the rendering implementation confirms that renderHash is computed over sourceRevision, the actual built-bundle hash, pipeline hash (render.mjs + fonts.mjs), browser, year, layout inputs, and font hashes. Therefore the content-addressed renderHash includes dirty-bundle input rather than being a revision-only cache key.

However **bundleHash and pipelineHash are not separately retained in these manifests**. These manifests and the nominal sourceRevision alone cannot reproduce or independently reconstruct that renderHash preimage, nor prove which dirty source changes produced it. All source PDFs/manifests were preserved exactly; no sourceRevision rewrite or fabricated bundle evidence was added.

Before final publication the parent must review/record the actual PDF verification and either:

1. checkpoint the exact rendering source, retain its build/pipeline evidence and explicitly approve these immutable existing artifact hashes; or
2. regenerate from a clean checkpoint, yielding new renderHash paths/manifests and a separately reviewed artifact set.

Do not silently relabel or overwrite these preserved objects. This draft PR is artifact preparation only, not proof of personalized API integration, exact visual acceptance, or deployment.
