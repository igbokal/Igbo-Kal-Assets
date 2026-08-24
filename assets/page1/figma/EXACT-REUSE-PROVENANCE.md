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

## Component 22

Page 1 component set `226:188` has two exact exported vectors. The live MCP
exports were downloaded to local non-OneDrive temporary storage and compared by
SHA-256 before the consumer was written.

| Variant | Governed source | Bytes | SHA-256 |
|---|---|---:|---|
| `guy logo 2` (`226:185`) | `mobile-kalendar-navigation-226-898/threshold-guy.svg` | 11,040 | `e8c2f1e2f9ee2f33400053ec4553ab11eb8c6acb2a310cf68701a4774acf79c3` |
| `cardinal  1` (`226:187`) | `components/component-22/cardinal.svg` | 4,142 | `61c2ba7e87dc77afb303214391cbe2911931f3b489af28584f0f1effe8a829e3` |

The double space in `cardinal  1` is the literal Figma variant value. The set
has zero design instances, so exact implementation does not authorize a runtime
consumer or assign it a semantic meaning.

## Reflection-card identity set

All four live exports in component set `226:824` are byte-identical to the
already governed mobile-reflection emblems:

| Variant | Governed source | SHA-256 |
|---|---|---|
| `afo` | `mobile-reflection-102-560/izu-afo.svg` | `09691357818f02e7ba82427517b26e32953aedefa716270ea8a09577cefaca8e` |
| `eke` | `mobile-reflection-102-560/izu-eke.svg` | `9c63d5a0b95140befb34564f29621cc627ab2f1dbca43e0cb4cff800b5bb2782` |
| `nkwo` | `mobile-reflection-102-560/izu-nkwo.svg` | `7b7a7a2dd36576a56953999348a0889e1416bec36085d80f0e560987a2dd3cc3` |
| `orie` | `mobile-reflection-102-560/izu-orie.svg` | `cdc8cd27b138e9fd4545f22537efa12862c11d4d10e7c99eea8a3c15454df794` |

## Commercial candidate assets

The two unmounted commercial frames reuse the exact shared close vector and add
two frame-specific vectors. Equal byte length was not treated as equality: the
317-byte Admin check had a different hash and was rejected.

| Use | Governed source | Bytes | SHA-256 |
|---|---|---:|---|
| close | `mobile-reflection-102-560/close.svg` | 1,626 | `7fb79214ae838ee5e1339f78fe1569ae160743e3c48a185ac19eba4da3c2f2c7` |
| upgrade check | `commercial/upgrade-check.svg` | 317 | `8c1d138d02333299a086fbfb42169058e11b5d8cae5366bdda4b87d34a726fdd` |
| success sparkles | `commercial/upgrade-sparkles.svg` | 1,807 | `d990df593d02a39f1e59dca225c0d11099b91085d02d31e351e3596dfc66faf3` |

## GIF component set

The three animated fills in Page 1 component set `253:3011` already existed in
the Assets repository. Each live Figma raw-image response was downloaded and
matched byte-for-byte. The `messages` and `nsibidi` variants remain zero-copy
imports. The original `drumming` bytes were retired because their 40,922,378
bytes violate the repository-wide 25 MiB ceiling; the original byte count,
SHA-256, former path, and Figma attribution remain in this ledger.

| Variant | Existing asset | Bytes | SHA-256 | Reduced-motion source |
|---|---|---:|---|---|
| `messages` (`253:3008`) | `assets/gif/8a2f3abe77bdd81b4086ed2b1fd07fcf.gif` | 20,098,547 | `06aef0c62a22f73a77fd6cc61edd58cf3f7c9ee2c768fc6cc71c5250c6b53805` | `desktop-36-18/messages-reduced.png` |
| `nsibidi` (`253:3009`) | `assets/gif/e294baa24b4cc4ae05d245f5ccda196e.gif` | 20,819,524 | `046c07bddf905ee5c92e42d65b69e1b3e0af9e92aacbc5372bedd3b26c4ea365` | `components/gif/nsibidi-reduced.png` |
| `drumming` (`253:3010`, retired source bytes) | `assets/gif/14fd1b71d87b52cf9d40eed7891201d0.gif` | 40,922,378 | `c3e7e23b9a6b0c090e7a315c2dc40f84875a35d6abd7bb524d11e2ba9dddfaef` | `components/gif/drumming-reduced.png` |

The Page-1 browser consumer uses `components/gif/drumming-loop.webp`: a 21,280,180-byte
animated WebP derivative (`e8cab63c747b2ccafa7d72e89c881909198a138a2dda01fbd0c6cb5c2bee00ae`).
It preserves the source's 144-frame, approximately 6-second infinite loop and
alpha channel at 874×874, exactly two device pixels for the governed
436.966-square layout. The legacy URL now serves a 19,710,810-byte, 600×600,
144-frame compatibility GIF (`85d0286cea6bf8aec7cc37b559eaac42aad5ea31901d09a8999350b2153408af`)
so existing preloads remain valid without retaining an oversized binary. The
two new reduced-motion PNGs and the existing messages fallback remain exact
Figma raw-image sources. These derivatives are implemented-local evidence only;
they are not a visual-acceptance claim.
