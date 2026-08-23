import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const integrationDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(integrationDirectory, '..', '..');
export const igbokalAssetsRoot = fileURLToPath(
  new URL('../../assets/', import.meta.url),
);
export const page1AssetsRoot = fileURLToPath(
  new URL('../../assets/page1/figma/', import.meta.url),
);
export const page1AssetsAliasName = '@igbokal-page1-assets';
export const page1AssetsAlias = {
  find: page1AssetsAliasName,
  replacement: page1AssetsRoot,
};
export const igbokalAssetsAliasName = '@igbokal-assets';
export const igbokalAssetsAlias = {
  find: igbokalAssetsAliasName,
  replacement: igbokalAssetsRoot,
};

const oneDrivePattern = /(?:^|[\\/])OneDrive(?:\s*-\s*[^\\/]+)?(?:[\\/]|$)/i;
if (
  oneDrivePattern.test(integrationDirectory)
  || oneDrivePattern.test(page1AssetsRoot)
  || oneDrivePattern.test(igbokalAssetsRoot)
) {
  throw new Error('OneDrive paths are forbidden for the asset bridge.');
}

function readJson(name) {
  return JSON.parse(readFileSync(join(page1AssetsRoot, name), 'utf8'));
}

export function assertLocalPage1AssetBridge() {
  const manifest = readJson('manifest.json');
  const consumerMap = readJson('consumer-map.json');

  for (const file of manifest.files) {
    const absolutePath = join(page1AssetsRoot, file.path);
    if (!existsSync(absolutePath)) {
      throw new Error(`Governed local asset is missing: ${file.path}`);
    }
    const contents = readFileSync(absolutePath);
    const sha256 = createHash('sha256').update(contents).digest('hex');
    if (contents.length !== file.bytes || sha256 !== file.sha256) {
      throw new Error(`Governed local asset failed integrity verification: ${file.path}`);
    }
  }

  for (const file of manifest.reusedFiles ?? []) {
    const absolutePath = resolve(repositoryRoot, file.path);
    if (!absolutePath.startsWith(repositoryRoot) || !existsSync(absolutePath)) {
      throw new Error(`Governed reused asset is missing or unsafe: ${file.path}`);
    }
    const contents = readFileSync(absolutePath);
    const sha256 = createHash('sha256').update(contents).digest('hex');
    if (contents.length !== file.bytes || sha256 !== file.sha256) {
      throw new Error(`Governed reused asset failed integrity verification: ${file.path}`);
    }
  }

  if (
    consumerMap.localAlias !== page1AssetsAliasName
    || consumerMap.sharedAlias !== igbokalAssetsAliasName
  ) {
    throw new Error('Consumer map and Vite alias names have drifted.');
  }

  return page1AssetsAlias;
}

export function assertLocalIgboKalAssetBridge() {
  assertLocalPage1AssetBridge();
  return igbokalAssetsAlias;
}

export function requirePublishedPage1AssetBaseUrl() {
  const proof = readJson('publication-proof.json');
  const consumerMap = readJson('consumer-map.json');
  const manifestBytes = readFileSync(join(page1AssetsRoot, 'manifest.json'));
  const manifestSha256 = createHash('sha256').update(manifestBytes).digest('hex');

  if (
    proof.status !== 'published'
    || proof.manifestSha256 !== manifestSha256
    || proof.verifiedBaseUrl !== consumerMap.publishedBaseUrl
    || Number.isNaN(Date.parse(proof.verifiedAt))
  ) {
    throw new Error('Page 1 CDN publication proof is absent or stale.');
  }

  return consumerMap.publishedBaseUrl;
}
