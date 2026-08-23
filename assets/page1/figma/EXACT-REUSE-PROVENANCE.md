# Exact Page 1 asset reuse

## Mobile Today ordinary state

- Page 1 frame: `102:711`
- Figma asset node: `114:78`
- Figma layer: `nkwo 1`
- Rendered frame size: `291.073 x 351`
- Governed source: `assets/images/nkwo.png`
- Source pixel size: `340 x 410`
- Bytes: `51,664`
- SHA-256: `2df80fb57abde1194dc56adb74ad3a3fc496bf00f8026e10fc9ecca04962bd23`
- Consumer import: `@igbokal-assets/images/nkwo.png?url`

The live Figma export and the pre-existing governed asset were independently
hashed and are byte-identical. The Page 1 corpus records the existing file as an
exact zero-copy reuse; it does not create another `nkwo.png`.

## Moon phase component set

Page 1 component set `188:143` is already governed, with eight exact variants,
under `assets/page1/moon-phases/manifest.json`. Consumers must use the shared
root alias `@igbokal-assets/page1/moon-phases/<file>.png?url`. Traversing outside
the narrower Page 1 Figma alias with `../moon-phases` is forbidden.

## Mobile day-detail dialog

The two new node `159:340` local captures are byte-identical to governed Page 1
files and require no new binary:

| Local capture | Governed reuse | SHA-256 |
|---|---|---|
| `close.svg` | `mobile-reflection-102-560/close.svg` | `7fb79214ae838ee5e1339f78fe1569ae160743e3c48a185ac19eba4da3c2f2c7` |
| `pattern.svg` | `mobile-reflection-102-560/splash-bottom.svg` | `1b0143629b1f213f6b42d983656267d67ebe85749acd73e531829dc4171c599d` |

The PWA owner may delete those two local captures only after switching both
imports and proving the rendered/build output uses the governed hashes.
