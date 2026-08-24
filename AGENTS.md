# IgboKal Assets agent policy

Root [`../../AGENTS.md`](../../AGENTS.md) and [`../../docs/POLICY.md`](../../docs/POLICY.md) apply here.

- This repository is the production static-asset CDN. Do not commit production binaries to the PWA.
- Use ASCII-lowercase hyphenated filenames. Keep every icon's 192px and 512px variants and no file above 25 MB.
- Put Lottie JSON under `assets/animations/` and return stable GitHub Pages URLs to Agent-PWA.
- Preserve provenance and licensing records for imported assets.
- Never load more than ten images into one agent context; batch visual review when necessary.
- Asset updates and submodule-pointer updates are separate commits with a PWA consumer handoff.
