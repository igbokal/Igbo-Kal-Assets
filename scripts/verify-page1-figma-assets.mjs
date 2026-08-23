import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const assetRoot = join(repositoryRoot, 'assets', 'page1', 'figma');
const manifestPath = join(assetRoot, 'manifest.json');
const consumerMapPath = join(assetRoot, 'consumer-map.json');
const publicationProofPath = join(assetRoot, 'publication-proof.json');
const MAX_BYTES = 25 * 1024 * 1024;
const FILE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:gif|jpe?g|png|svg|webp)$/;
const DIRECTORY_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ONE_DRIVE_PATTERN = /(?:^|[\\/])OneDrive(?:\s*-\s*[^\\/]+)?(?:[\\/]|$)/i;

if (ONE_DRIVE_PATTERN.test(repositoryRoot) || ONE_DRIVE_PATTERN.test(assetRoot)) {
  throw new Error('OneDrive paths are forbidden for the asset pipeline.');
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath));
    } else if (entry.isFile() && FILE_NAME_PATTERN.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function pngDimensions(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) {
    throw new Error('Identity variant is not a valid PNG.');
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const absoluteFiles = (await walk(assetRoot)).sort();
const files = [];
const consumerMap = JSON.parse(await readFile(consumerMapPath, 'utf8'));
const publicationProof = JSON.parse(await readFile(publicationProofPath, 'utf8'));

for (const absolutePath of absoluteFiles) {
  const info = await stat(absolutePath);
  const path = relative(assetRoot, absolutePath).replaceAll('\\', '/');
  const name = path.split('/').at(-1);
  const directorySegments = path.split('/').slice(0, -1);

  if (!FILE_NAME_PATTERN.test(name)) {
    throw new Error(`Non-canonical asset filename: ${path}`);
  }
  if (directorySegments.some((segment) => !DIRECTORY_NAME_PATTERN.test(segment))) {
    throw new Error(`Non-canonical asset directory: ${path}`);
  }
  if (info.size > MAX_BYTES) {
    throw new Error(`Asset exceeds 25 MiB: ${path} (${info.size} bytes)`);
  }

  const contents = await readFile(absolutePath);
  files.push({
    path,
    bytes: info.size,
    sha256: createHash('sha256').update(contents).digest('hex'),
  });
}

for (const [name, expectedSize] of [
  ['identity/igbokal-app-icon-192.png', 192],
  ['identity/igbokal-app-icon-512.png', 512],
]) {
  const dimensions = pngDimensions(await readFile(join(assetRoot, name)));
  if (dimensions.width !== expectedSize || dimensions.height !== expectedSize) {
    throw new Error(`${name} must be exactly ${expectedSize}x${expectedSize}.`);
  }
}

async function verifiedRepositoryAsset(repositoryPath, expectedBytes, expectedSha256) {
  if (
    ONE_DRIVE_PATTERN.test(repositoryPath)
    || repositoryPath.startsWith('/')
    || repositoryPath.includes('..')
  ) {
    throw new Error(`Unsafe repository asset path: ${repositoryPath}`);
  }

  const absolutePath = resolve(repositoryRoot, repositoryPath);
  if (!absolutePath.startsWith(repositoryRoot)) {
    throw new Error(`Repository asset escaped root: ${repositoryPath}`);
  }
  const info = await stat(absolutePath);
  const contents = await readFile(absolutePath);
  const sha256 = createHash('sha256').update(contents).digest('hex');
  if (info.size !== expectedBytes || sha256 !== expectedSha256) {
    throw new Error(`Exact reuse failed integrity verification: ${repositoryPath}`);
  }

  return { path: repositoryPath, bytes: info.size, sha256 };
}

const reusedFiles = [];
for (const reuse of consumerMap.exactExternalReuses ?? []) {
  reusedFiles.push({
    ...await verifiedRepositoryAsset(reuse.assetRepositoryPath, reuse.bytes, reuse.sha256),
    authority: {
      figmaFrameNode: reuse.figmaFrameNode,
      figmaAssetNode: reuse.figmaAssetNode,
      figmaLayer: reuse.figmaLayer,
    },
  });
}

for (const collection of consumerMap.governedCollections ?? []) {
  if (
    collection.manifestRepositoryPath.startsWith('/')
    || collection.manifestRepositoryPath.includes('..')
    || collection.assetRepositoryRoot.startsWith('/')
    || collection.assetRepositoryRoot.includes('..')
  ) {
    throw new Error(`Unsafe governed collection path: ${collection.manifestRepositoryPath}`);
  }
  const collectionManifest = JSON.parse(
    await readFile(resolve(repositoryRoot, collection.manifestRepositoryPath), 'utf8'),
  );
  for (const asset of collectionManifest.assets) {
    const repositoryPath = `${collection.assetRepositoryRoot}/${asset.file}`;
    const info = await stat(resolve(repositoryRoot, repositoryPath));
    reusedFiles.push({
      ...await verifiedRepositoryAsset(repositoryPath, info.size, asset.sha256),
      authority: {
        figmaComponentNode: collection.figmaComponentNode,
        governedCollectionManifest: collection.manifestRepositoryPath,
      },
    });
  }
  if (collection.consumerImportPrefix.includes('..')) {
    throw new Error(`Collection import prefix may not traverse: ${collection.consumerImportPrefix}`);
  }
}

for (const reuse of consumerMap.sourceReuses ?? []) {
  await verifiedRepositoryAsset(reuse.assetRepositoryPath, reuse.bytes, reuse.sha256);
  if (ONE_DRIVE_PATTERN.test(reuse.source) || reuse.source.includes('..')) {
    throw new Error(`Unsafe source reuse path: ${reuse.source}`);
  }
  if (reuse.consumerImport.includes('..')) {
    throw new Error(`Consumer reuse import may not traverse: ${reuse.consumerImport}`);
  }
}

reusedFiles.sort((left, right) => left.path.localeCompare(right.path));

const manifest = {
  schemaVersion: 2,
  source: {
    provider: 'Figma',
    fileKey: 'TTNkBhwPq88j9wRgrGOCAt',
    page: 'Page 1',
    readiness: 'READY_FOR_DEV',
  },
  maxAssetBytes: MAX_BYTES,
  files,
  reusedFiles,
};
const serializedManifest = `${JSON.stringify(manifest, null, 2)}\n`;

const mappedPaths = [];

for (const mapping of consumerMap.mappings) {
  if (
    ONE_DRIVE_PATTERN.test(mapping.sourceRoot)
    || mapping.sourceRoot.startsWith('/')
    || mapping.sourceRoot.includes('..')
    || mapping.assetRoot.startsWith('/')
    || mapping.assetRoot.includes('..')
  ) {
    throw new Error(`Unsafe consumer mapping: ${mapping.sourceRoot}`);
  }

  for (const file of mapping.files ?? []) {
    mappedPaths.push(`${mapping.assetRoot}/${file}`);
  }
  for (const rename of mapping.renames ?? []) {
    mappedPaths.push(`${mapping.assetRoot}/${rename.asset}`);
  }
}

const uniqueMappedPaths = new Set(mappedPaths);
if (uniqueMappedPaths.size !== mappedPaths.length) {
  throw new Error('Consumer map assigns an asset more than once.');
}

const manifestPaths = new Set(files.map((file) => file.path));
const missingMappings = files
  .map((file) => file.path)
  .filter((path) => !uniqueMappedPaths.has(path));
const missingAssets = mappedPaths.filter((path) => !manifestPaths.has(path));
if (missingMappings.length || missingAssets.length) {
  throw new Error(
    `Consumer map mismatch. Unmapped: ${missingMappings.join(', ') || 'none'}; missing: ${missingAssets.join(', ') || 'none'}`,
  );
}

if (publicationProof.status === 'unpublished') {
  for (const field of ['manifestSha256', 'verifiedAt', 'verifiedBaseUrl']) {
    if (publicationProof[field] !== null) {
      throw new Error(`Unpublished proof field must be null: ${field}`);
    }
  }
} else if (publicationProof.status === 'published') {
  const expectedManifestHash = createHash('sha256').update(serializedManifest).digest('hex');
  if (publicationProof.manifestSha256 !== expectedManifestHash) {
    throw new Error('Published manifest proof does not match the governed manifest.');
  }
  if (publicationProof.verifiedBaseUrl !== consumerMap.publishedBaseUrl) {
    throw new Error('Published base URL does not match the consumer contract.');
  }
  if (Number.isNaN(Date.parse(publicationProof.verifiedAt))) {
    throw new Error('Published proof requires a valid verification timestamp.');
  }
} else {
  throw new Error(`Unknown publication status: ${publicationProof.status}`);
}

if (process.argv.includes('--write')) {
  await writeFile(manifestPath, serializedManifest, 'utf8');
  console.log(`Wrote ${files.length} corpus assets and ${reusedFiles.length} zero-copy reuses to ${relative(repositoryRoot, manifestPath)}.`);
} else {
  const recorded = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (JSON.stringify(recorded) !== JSON.stringify(manifest)) {
    throw new Error('Page 1 Figma asset manifest is stale.');
  }
  console.log(`Verified ${files.length} Page 1 Figma assets and ${reusedFiles.length} zero-copy reuses.`);
}
