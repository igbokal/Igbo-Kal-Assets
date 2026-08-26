# Desktop install QR modal assets — provenance

These files are verbatim SVG assets returned by the official Figma MCP for
Page 1 frame `260:3116` in file `TTNkBhwPq88j9wRgrGOCAt`. They were retrieved
on 2026-08-26 after `get_design_context` independently identified each asset
URL. No path, geometry, color, or markup was hand-authored or traced.

The two decoration files were then downloaded a second time through the
official `download_assets` result and matched the committed copies byte for
byte. Their reported byte counts and SHA-256 values were identical across both
retrieval paths.

Temporary Figma download URLs are intentionally omitted because they expire and
must not become a production dependency. The committed SHA-256 values are the
stable byte-identity contract.

| Figma node | Purpose | Governed file | Intrinsic SVG size | Bytes | SHA-256 |
|---|---|---|---:|---:|---|
| `260:3117` | upper/right QR decoration | `qr-decoration-top.svg` | 725.173×444.699 | 10,150 | `2f231e030e833e35064d6563cb66040e2199bfcd07311f7c6980aea6f0707569` |
| `260:3145` | lower/left QR decoration | `qr-decoration-bottom.svg` | 865.551×461.798 | 10,182 | `b8985493bf1f301a460b62f3da42cc09b89b7adb5a45430806e8f49652df719e` |
| `260:3144` | back glyph | `back-glyph.svg` | 38.272×44.6135 | 391 | `9805cd221281d78119ff66d062792d20c6228cc4ca75ad328392e5740dfbee04` |

The live frame applies its own rotation matrices and clipping to the two
decoration assets. Consumers must preserve those frame-level transforms rather
than modify these source bytes. Presence in the Assets repository is production
asset governance, not a claim that Page-1 formal visual acceptance has passed.

Stable CDN paths after publication:

- `https://igbokal.github.io/Igbo-Kal-Assets/assets/page1/figma/desktop-install-qr-260-3116/qr-decoration-top.svg`
- `https://igbokal.github.io/Igbo-Kal-Assets/assets/page1/figma/desktop-install-qr-260-3116/qr-decoration-bottom.svg`
- `https://igbokal.github.io/Igbo-Kal-Assets/assets/page1/figma/desktop-install-qr-260-3116/back-glyph.svg`
