# Page 1 Figma production assets

This directory is the local handoff boundary for exact production assets exported
from the annotated Page 1 `READY_FOR_DEV` designs in Figma file
`TTNkBhwPq88j9wRgrGOCAt`.

The source captures remain untouched in the owning app worktree. These copies are
not live until this Assets submodule is committed and published, and no consumer
may switch to a CDN URL before that URL is reachable and hash-verified.

## Stable CDN prefix

After publication, files resolve below:

`https://igbokal.github.io/Igbo-Kal-Assets/assets/page1/figma/`

The directory layout deliberately retains the Figma implementation slice:

- `mobile-calendar-102-81/`
- `mobile-reflection-102-560/`
- `desktop-36-18/`
- `desktop-install-qr-260-3116/` — exact official Figma SVG exports for
  QR-modal decoration nodes `260:3117` and `260:3145`, plus the back glyph
  `260:3144`; see the local provenance register.
- `admin/capsules/`
- `admin/dashboard/`
- `admin/glossary/`
- `admin/users/`
- `identity/`
- `baselines/` — native-width PNG renders of the six implemented-local
  Page-1 mobile nodes (`102:16`, `102:81`, `102:560`, `226:898`, `157:126`,
  `223:173`), captured exact to Figma per the 2026-08-23 owner ruling;
  provenance in `baselines/PROVENANCE.md`. Fidelity evidence, not acceptance.

`identity/` contains the required 192px and 512px variants of the IgboKal app
identity. Install-manifest icons and favicons may remain local to the PWA as the
explicit identity exception in workspace policy. A runtime duplicate imported
only for a page should instead use the local identity source or the published CDN
asset; it must not create a third production copy.

The Google glyph is intentionally excluded from this CDN handoff. It is a
third-party service mark, Google OAuth is not an approved backend capability in
the current contract, and it needs a separate brand/licensing decision.

## Code-native exceptions

Small interface glyphs such as close, plus, search, chevron, bell, menu,
dashboard, book, edit, and trash may remain in an app only when their exact paths
are expressed as source-controlled React/SVG code rather than copied static
production files. The Figma node attribution must remain in code or provenance.
Illustrations, chakra/season/direction artwork, splashes, izu marks, animated
media, and raster art are not code-native exceptions and belong here.

## Verification and sequencing

Run `node scripts/verify-page1-figma-assets.mjs --write` only when intentionally
refreshing the manifest, then run it without flags as the verification gate.

Cross-repository order is strict:

1. Commit these assets and `manifest.json` in the Assets submodule.
2. Publish and verify every intended CDN URL against its recorded SHA-256.
3. Update PWA/Admin consumers and offline-cache policy; verify their builds.
4. Commit the parent repository's consumer changes and submodule pointer together.

Do not reverse steps 1 and 2: a consumer must never deploy before its immutable
asset path exists.

## Local build bridge

`consumer-map.json` is the exact source-to-Assets contract. Before publication,
PWA and Admin Vite builds should alias `@igbokal-page1-assets` to the map's
`localAliasTargetFromWorkspace` and import governed files through that alias.
Vite then bundles the same verified bytes for local tests without committing a
second copy in either app repository.

The shared helper is `integrations/vite/page1-assets.mjs`. A consuming Vite
config should import `page1AssetsAlias` and `assertLocalPage1AssetBridge`, call
the assertion during configuration, and append the alias to `resolve.alias`.
Source modules can then use imports such as
`@igbokal-page1-assets/mobile-today-336-995/moon.png?url`.

Existing governed files outside this narrow corpus are exposed without copying
through `igbokalAssetsAlias` (`@igbokal-assets`). This is the required bridge for
the exact `188:143` moon-phase collection and the exact `102:711` Nkwọ́ reuse.
Imports must stay root-contained, for example
`@igbokal-assets/page1/moon-phases/moon-full.png?url`; `../` alias traversal is
forbidden. The adjacent `page1-assets.d.mts` declaration types all bridge
exports for Vite, Vitest, and TypeScript consumers.

Admin should retain its own `_redirects` public file and replace `/figma/...`
public-file references with imported `?url` values from the alias. Pointing
Admin's entire `publicDir` at this directory would drop `_redirects` and is not
an acceptable bridge.

`publication-proof.json` intentionally remains `unpublished` with null proof
fields. Consumer configuration must not select `publishedBaseUrl` while that is
true. Publication proof may be populated only after the deployed manifest and
every consumed file are retrieved and hash-verified.
`requirePublishedPage1AssetBaseUrl()` enforces that fail-closed transition and
currently throws by design.
