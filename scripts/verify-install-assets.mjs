import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const installRoot = join(repositoryRoot, 'assets', 'install');
const manifestPath = join(installRoot, 'manifest.json');
const publicationProofPath = join(installRoot, 'publication-proof.json');
const page1ManifestPath = join(repositoryRoot, 'assets', 'page1', 'figma', 'manifest.json');
const MAX_BYTES = 25 * 1024 * 1024;
const ONE_DRIVE_PATTERN = /(?:^|[\\/])OneDrive(?:\s*-\s*[^\\/]+)?(?:[\\/]|$)/i;
const CANONICAL_FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:json|md|png)$/;

if (ONE_DRIVE_PATTERN.test(repositoryRoot) || ONE_DRIVE_PATTERN.test(installRoot)) {
  throw new Error('OneDrive paths are forbidden for the install-asset pipeline.');
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function paeth(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
}

function decodePng(bytes) {
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('Install icon is not a PNG.');
  }

  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const compressed = [];

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      compressed.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (!width || !height || bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    throw new Error(`Unsupported PNG layout: ${width}x${height}, depth ${bitDepth}, type ${colorType}, interlace ${interlace}.`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const filtered = inflateSync(Buffer.concat(compressed));
  if (filtered.length !== (stride + 1) * height) {
    throw new Error('PNG scanline size does not match its IHDR.');
  }

  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const filter = filtered[y * (stride + 1)];
    for (let x = 0; x < stride; x += 1) {
      const source = filtered[y * (stride + 1) + x + 1];
      const left = x >= channels ? raw[y * stride + x - channels] : 0;
      const above = y > 0 ? raw[(y - 1) * stride + x] : 0;
      const upperLeft = y > 0 && x >= channels ? raw[(y - 1) * stride + x - channels] : 0;
      let value;
      if (filter === 0) value = source;
      else if (filter === 1) value = source + left;
      else if (filter === 2) value = source + above;
      else if (filter === 3) value = source + Math.floor((left + above) / 2);
      else if (filter === 4) value = source + paeth(left, above, upperLeft);
      else throw new Error(`Unsupported PNG filter ${filter}.`);
      raw[y * stride + x] = value & 0xff;
    }
  }

  return { width, height, channels, raw };
}

function analyzePng(decoded) {
  const { width, height, channels, raw } = decoded;
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;
  let maxGreenRadius = 0;
  let greenPixelCount = 0;
  let transparentPixelCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * channels;
      const red = raw[pixel];
      const green = raw[pixel + 1];
      const blue = raw[pixel + 2];
      const alpha = channels === 4 ? raw[pixel + 3] : 255;
      if (alpha !== 255) transparentPixelCount += 1;
      if (alpha > 127 && green * 100 > red * 108 && green * 100 > blue * 108) {
        greenPixelCount += 1;
        maxGreenRadius = Math.max(maxGreenRadius, Math.hypot(x - centerX, y - centerY));
      }
    }
  }

  return {
    transparentPixelCount,
    greenPixelCount,
    maxGreenRadiusRatio: maxGreenRadius / width,
  };
}

const manifestBytes = await readFile(manifestPath);
const manifest = JSON.parse(manifestBytes.toString('utf8'));
const proof = JSON.parse(await readFile(publicationProofPath, 'utf8'));
const page1Manifest = JSON.parse(await readFile(page1ManifestPath, 'utf8'));

if (manifest.schemaVersion !== 1 || manifest.backgroundColor !== '#fefee4') {
  throw new Error('Install manifest schema or background colour drifted.');
}
if (manifest.maskable.safeRadiusRatio !== 0.4 || manifest.maskable.insetScale !== 0.9375) {
  throw new Error('Maskable safe-zone contract drifted.');
}

const manifestAssetPaths = manifest.assets.map((asset) => asset.path).sort();
const installPngPaths = (await readdir(installRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
  .map((entry) => entry.name)
  .sort();
if (JSON.stringify(installPngPaths) !== JSON.stringify(manifestAssetPaths)) {
  throw new Error(`Install PNG inventory drifted. Manifest: ${manifestAssetPaths.join(', ')}; disk: ${installPngPaths.join(', ')}.`);
}

for (const source of manifest.sources) {
  const sourcePath = resolve(repositoryRoot, source.path);
  if (!sourcePath.startsWith(repositoryRoot) || ONE_DRIVE_PATTERN.test(sourcePath)) {
    throw new Error(`Unsafe source path: ${source.path}`);
  }
  const bytes = await readFile(sourcePath);
  if (bytes.length !== source.bytes || sha256(bytes) !== source.sha256) {
    throw new Error(`Install source integrity failed: ${source.path}`);
  }
}

for (const asset of manifest.assets) {
  if (!CANONICAL_FILE_NAME.test(asset.path) || !asset.path.endsWith('.png') || asset.path.includes('/') || asset.path.includes('\\')) {
    throw new Error(`Non-canonical install asset path: ${asset.path}`);
  }
  const bytes = await readFile(join(installRoot, asset.path));
  if (bytes.length > MAX_BYTES || bytes.length !== asset.bytes || sha256(bytes) !== asset.sha256) {
    throw new Error(`Install asset integrity failed: ${asset.path}`);
  }
  const decoded = decodePng(bytes);
  const analysis = analyzePng(decoded);
  if (decoded.width !== asset.width || decoded.height !== asset.height || decoded.width !== decoded.height) {
    throw new Error(`Install asset dimensions drifted: ${asset.path}`);
  }
  if (analysis.transparentPixelCount !== 0) {
    throw new Error(`Install asset is not fully opaque: ${asset.path}`);
  }
  if (analysis.greenPixelCount === 0) {
    throw new Error(`Install asset has no detectable identity artwork: ${asset.path}`);
  }
  if (asset.role === 'maskable' && analysis.maxGreenRadiusRatio > manifest.maskable.safeRadiusRatio) {
    throw new Error(`Maskable artwork escapes the safe circle: ${asset.path} (${analysis.maxGreenRadiusRatio}).`);
  }
}

const page1ByPath = new Map(page1Manifest.files.map((file) => [file.path, file]));
for (const baseline of manifest.howToFigmaBaselines) {
  const governed = page1ByPath.get(baseline.path);
  if (!governed || governed.sha256 !== baseline.sha256 || governed.bytes !== baseline.bytes) {
    throw new Error(`How-to baseline is not governed by the Page 1 manifest: ${baseline.path}`);
  }
  const baselineBytes = await readFile(join(dirname(page1ManifestPath), baseline.path));
  if (baselineBytes.length !== baseline.bytes || sha256(baselineBytes) !== baseline.sha256) {
    throw new Error(`How-to baseline integrity failed: ${baseline.path}`);
  }
}

if (manifest.runtimeScreenshots.status !== 'blocked-awaiting-runtime-capture' || manifest.runtimeScreenshots.assets.length !== 0) {
  throw new Error('Runtime screenshots may not be claimed before deterministic app captures exist.');
}

if (proof.status === 'unpublished') {
  for (const field of ['manifestSha256', 'verifiedAt', 'verifiedBaseUrl']) {
    if (proof[field] !== null) throw new Error(`Unpublished proof field must be null: ${field}`);
  }
} else if (proof.status === 'published') {
  if (proof.manifestSha256 !== sha256(manifestBytes)) {
    throw new Error('Published install proof does not match manifest.json.');
  }
  if (proof.verifiedBaseUrl !== manifest.publishedBaseUrl || Number.isNaN(Date.parse(proof.verifiedAt))) {
    throw new Error('Published install proof has invalid URL or timestamp.');
  }
} else {
  throw new Error(`Unknown publication status: ${proof.status}`);
}

console.log(`Verified ${manifest.assets.length} opaque install assets, ${manifest.howToFigmaBaselines.length} governed How-to baselines, and a fail-closed runtime-screenshot handoff.`);
