// Fetch unmodified public upstream payloads; never publishes or stages files.
import { mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
if (/onedrive/i.test(root)) throw Error('OneDrive forbidden');
const revision = '5bb28733cec313b63fbd415b574b5ae35c8aa8b8';
const sha = b => createHash('sha256').update(b).digest('hex');
const groups = [
  ['worksans', 'Work Sans', 'work-sans', [['WorkSans[wght].ttf', 'normal', '100 900'], ['WorkSans-Italic[wght].ttf', 'italic', '100 900']]],
  ['ebgaramond', 'EB Garamond', 'eb-garamond', [['EBGaramond[wght].ttf', 'normal', '400 800'], ['EBGaramond-Italic[wght].ttf', 'italic', '400 800']]],
  ['ribeye', 'Ribeye', 'ribeye', [['Ribeye-Regular.ttf', 'normal', '400']]],
];
const inventory = [];
const evidence = [];
async function acquire(upstream, local) {
  const url = `https://raw.githubusercontent.com/google/fonts/${revision}/${upstream.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(url, { redirect: 'error' });
  if (!response.ok) throw Error(`${response.status}: ${upstream}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 25 * 1024 * 1024) throw Error('Invalid asset size');
  const path = resolve(root, local);
  await mkdir(dirname(path), { recursive: true });
  try { const prior = await readFile(path); if (!prior.equals(bytes)) throw Error(`Refusing overwrite: ${local}`); }
  catch (e) { if (e.code !== 'ENOENT') throw e; await writeFile(path, bytes, { flag: 'wx' }); }
  return { path: local, sourceUrl: url, sha256: sha(bytes), bytes: bytes.length, data: bytes };
}
function sfnt(b) {
  if (b.readUInt32BE(0) !== 0x00010000) throw Error('Not TrueType');
  const tables = {};
  for (let i = 0; i < b.readUInt16BE(4); i++) {
    const p = 12 + i * 16, tag = b.toString('ascii', p, p + 4), offset = b.readUInt32BE(p + 8), length = b.readUInt32BE(p + 12);
    if (offset + length > b.length) throw Error('Truncated sfnt table');
    tables[tag] = b.subarray(offset, offset + length);
  }
  const names = {};
  const n = tables.name;
  for (let i = 0; i < n.readUInt16BE(2); i++) {
    const p = 6 + i * 12, platform = n.readUInt16BE(p), id = n.readUInt16BE(p + 6);
    const start = n.readUInt16BE(4) + n.readUInt16BE(p + 10), len = n.readUInt16BE(p + 8);
    if (platform !== 0 && platform !== 3) continue;
    const text = Buffer.from(n.subarray(start, start + len)).swap16().toString('utf16le');
    (names[id] ||= []).includes(text) || names[id].push(text);
  }
  const axes = [];
  if (tables.fvar) {
    const f = tables.fvar;
    for (let i = 0; i < f.readUInt16BE(8); i++) {
      const p = f.readUInt16BE(4) + i * f.readUInt16BE(10);
      axes.push({ tag: f.toString('ascii', p, p + 4), min: f.readInt32BE(p + 4) / 65536, default: f.readInt32BE(p + 8) / 65536, max: f.readInt32BE(p + 12) / 65536 });
    }
  }
  return { names, axes, weight: tables['OS/2'].readUInt16BE(4), italic: !!(tables['OS/2'].readUInt16BE(62) & 1) };
}
const clean = ({ data, ...record }) => record;
for (const [upstream, family, slug, files] of groups) {
  const dir = `assets/fonts/${slug}`;
  const license = await acquire(`ofl/${upstream}/OFL.txt`, `${dir}/ofl.txt`);
  const metadata = await acquire(`ofl/${upstream}/METADATA.pb`, `${dir}/metadata.pb`);
  const licenseText = license.data.toString('utf8'), metadataText = metadata.data.toString('utf8');
  if (!licenseText.includes('SIL OPEN FONT LICENSE Version 1.1') || !metadataText.includes('license: "OFL"')) throw Error(`Missing upstream OFL evidence: ${family}`);
  evidence.push(clean(license), clean(metadata));
  for (const [source, style, weight] of files) {
    if (!metadataText.includes(`filename: "${source}"`)) throw Error('Font not in upstream metadata');
    const payload = await acquire(`ofl/${upstream}/${source}`, `${dir}/${slug}-${style === 'normal' ? 'regular' : 'italic'}${weight.includes(' ') ? '-variable' : ''}.ttf`);
    const info = sfnt(payload.data);
    if (!(info.names[1] || []).includes(family) && !(info.names[16] || []).includes(family)) throw Error('Family mismatch');
    if (info.italic !== (style === 'italic')) throw Error('Style mismatch');
    const [min, max = min] = weight.split(' ').map(Number);
    if (min !== max && !info.axes.some(a => a.tag === 'wght' && a.min === min && a.max === max)) throw Error('Weight axis mismatch');
    if (min === max && info.weight !== min) throw Error('Static weight mismatch');
    const normalize = s => s.replace(/\s+/g, ' ').trim();
    // Ribeye's upstream OFL covers both Ribeye and Ribeye Marrow; its embedded
    // notice names only Ribeye. Match the author verbatim and every embedded RFN.
    const copyright = (info.names[0] || []).find(text => {
      const notice = normalize(text), ofl = normalize(licenseText);
      if (ofl.includes(notice)) return true;
      const [author, reserved] = notice.split(', with Reserved Font Name');
      const names = reserved?.match(/"[^"]+"/g);
      return !!names?.length && ofl.includes(author) && names.every(name => ofl.includes(name));
    });
    if (!copyright) throw Error(`Embedded copyright not covered by upstream OFL: ${family}: ${JSON.stringify(info.names[0])}`);
    if (!(info.names[13] || []).some(s => /open font license/i.test(s))) throw Error('Embedded license does not identify OFL');
    const record = { family, style, weight, ...clean(payload), format: 'truetype', mimeType: 'font/ttf', version: info.names[5], copyright, license: 'OFL-1.1', licensePath: license.path, licenseSha256: license.sha256, metadataPath: metadata.path, metadataSha256: metadata.sha256, axes: info.axes };
    inventory.push(record);
    console.log(JSON.stringify({ family, style, weight, sha256: record.sha256, version: record.version, licenseSha256: record.licenseSha256 }));
  }
}
await writeFile(resolve(root, 'assets/fonts/font-provenance.json'), JSON.stringify({ schemaVersion: 1, repository: 'https://github.com/google/fonts', revision, transformation: 'none; byte-identical upstream TrueType payloads, local filename changes only', publicationStatus: 'local-preparation-only', evidence, fonts: inventory }, null, 2) + '\n');
console.log('Verified five unmodified TTF payloads, three upstream OFLs and metadata; no publication.');
