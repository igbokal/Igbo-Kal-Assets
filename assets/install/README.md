# Install and How-to assets

This directory governs install-specific identity derivatives and the asset handoff
for the IgboKal PWA. It does not turn a Figma baseline into runtime proof.

The maskable icons are deterministic derivatives of the Page 1 identity pair.
They use a fully opaque `#fefee4` canvas and inset the governed mark to 15/16 of
the canvas. That inset keeps every green identity pixel inside the maskable-icon
safe circle (radius 40% of the canvas) while allowing launchers to crop the
non-critical background.

`igbokal-apple-touch-icon-180.png` is the platform-specific, fully opaque Apple
touch icon. The required 192px and 512px icon variants remain present as the
maskable pair.

## How-to baseline handoff

These already-governed Page 1 captures may support a design-labelled How-to
gallery after publication:

- `../page1/figma/baselines/102-16.png` — mobile landing
- `../page1/figma/baselines/157-126.png` — mobile login
- `../page1/figma/baselines/102-81.png` — mobile Kalendar
- `../page1/figma/baselines/226-898.png` — month selector
- `../page1/figma/baselines/102-560.png` — reflection dialog
- `../page1/figma/baselines/223-173.png` — glossary
- `../page1/figma/baselines/38-4469.png` — desktop month

They must be captioned as Figma design references, not current runtime
screenshots. Do not use `260-3116.png` (mock QR and superseded copy),
`39-539.png` (open font decision), or unmasked `36-18.png` (superseded Archive
and Calculation labels) on a user-facing guide.

Manifest `screenshots` entries require fresh, deterministic captures of the
actual app-origin runtime at the supported phone widths. No such captures are
stored here yet; the manifest must not claim Figma evidence as installed-app
runtime.

## Publication

The stable prefix will be:

`https://igbokal.github.io/Igbo-Kal-Assets/assets/install/`

`publication-proof.json` remains `unpublished` until the Assets commit is on
GitHub Pages and the remote manifest plus every consumed file has been fetched
and SHA-256 verified. Consumers must keep using the local bridge until then.

Run `node scripts/verify-install-assets.mjs` from this repository before handoff.
