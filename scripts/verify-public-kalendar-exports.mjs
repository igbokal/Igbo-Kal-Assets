// Verifies public release bytes only. Optional --import=<ready root> copies exact
// manifest-listed files, never directory trees or personalized/assembled outputs.
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const arg = process.argv.slice(2);
if (arg.length > 1 || (arg.length && !arg[0].startsWith('--import='))) throw Error('Usage: node scripts/verify-public-kalendar-exports.mjs [--import=<ready root>]');
const source = arg.length ? await realpath(resolve(arg[0].slice(9))) : null;
if ([root, source].filter(Boolean).some(p => /onedrive/i.test(p))) throw Error('OneDrive forbidden');
const hashes = {
  5003: 'dd20aa3d5b9199d2ce681fbb73d8e266560dffd6189a103e549ca655129ebe0d',
  5004: '1d37e6424442545cd1f5fe9528b06974fa4a2b5a27596f8d06f612a5e3c2dbe3',
  5005: 'fdb2a075c2b99b796ab8ad163da874119791cc7235e20b23dbb7dbc96a419ddb',
  5006: '2aa5fabe22de45334aea39f81d6abe0701722d2bea1867ee12cda2fd7c6db98d',
};
const sha = b => createHash('sha256').update(b).digest('hex');
const provenance = JSON.parse(await readFile(resolve(root, 'assets/fonts/font-provenance.json')));
if (provenance.revision !== '5bb28733cec313b63fbd415b574b5ae35c8aa8b8' || provenance.fonts.length !== 5 || provenance.evidence.length !== 6) throw Error('Unexpected font provenance');
for (const f of [...provenance.fonts, ...provenance.evidence]) {
 if (!/^assets\/fonts\/[a-z-]+\/[a-z0-9.-]+$/.test(f.path)) throw Error('Unsafe font path');
 const b = await readFile(resolve(root, f.path));
 if (b.length !== f.bytes || sha(b) !== f.sha256 || b.length > 25 * 1024 * 1024) throw Error('Font provenance hash/size mismatch');
}
const pending = [];
let count = 0, totalBytes = 0;
for (const [yearText, renderHash] of Object.entries(hashes)) {
 const year = Number(yearText), base = `kalendar-pages/${year}/${renderHash}`;
 const manifestPath = `${base}/manifest.json`;
 const manifestBytes = await readFile(source ? resolve(source, renderHash, 'manifest.json') : resolve(root, manifestPath));
 const m = JSON.parse(manifestBytes);
 const allowed = ['schemaVersion','status','rendererVersion','sourceRevision','renderHash','browserVersion','kind','layout','igboYear','fonts','files'];
 if (Object.keys(m).some(k => !allowed.includes(k))) throw Error('Unexpected/private manifest field');
 if (m.schemaVersion !== 1 || m.status !== 'ready' || m.kind !== 'month' || m.layout !== 'mobile-month-v1' || m.rendererVersion !== 'shared-react-1' || m.igboYear !== year || m.renderHash !== renderHash || m.sourceRevision !== '767923db82405dc9b9363240abcdcea5e6901eba' || m.files.length !== 14 || m.fonts.length !== 5) throw Error('Invalid public year manifest');
 const seenFonts = new Set();
 for (const f of m.fonts) {
   const p = provenance.fonts.find(p => p.family === f.family && p.style === f.style);
   if (!p || seenFonts.has(p.path)) throw Error('Unknown/duplicate font');
   seenFonts.add(p.path);
   for (const key of ['weight','sha256','bytes','sourceUrl','license','licenseSha256','metadataSha256','format','mimeType']) if (f[key] !== p[key]) throw Error('Manifest font provenance mismatch');
   if (f.sourceRevision !== provenance.revision || f.licensePath !== `card-exports/assets-fonts/${p.licensePath}` || f.metadataPath !== `card-exports/assets-fonts/${p.metadataPath}`) throw Error('Font source/license mismatch');
 }
 const indexes = new Set();
 let anchors = 0;
 for (const f of m.files) {
   if (Object.keys(f).some(k => !['index','path','sha256','bytes','widthPt','heightPt','pageCount','dayAnchors'].includes(k))) throw Error('Unexpected/private file field');
   if (!Number.isInteger(f.index) || f.index < 0 || f.index > 13 || indexes.has(f.index)) throw Error('Invalid/duplicate period');
   indexes.add(f.index);
   const expected = `${base}/month-${String(f.index + 1).padStart(2,'0')}.pdf`;
   if (f.path !== expected || f.widthPt !== 612 || f.heightPt !== 792 || f.pageCount !== 1 || !/^[a-f0-9]{64}$/.test(f.sha256)) throw Error('Noncanonical file or geometry');
   const days = f.index < 13 ? 28 : year === 5005 ? 2 : 1;
   if (f.dayAnchors.length !== days) throw Error('Wrong month/threshold length');
   f.dayAnchors.forEach((a,i) => { if (Object.keys(a).some(k => !['day','x','y'].includes(k)) || a.day !== i+1 || !Number.isFinite(a.x) || !Number.isFinite(a.y) || a.x<0 || a.x>612 || a.y<0 || a.y>792) throw Error('Invalid/public anchor'); });
   const b = await readFile(source ? resolve(source, renderHash, f.path) : resolve(root, f.path));
   if (b.length !== f.bytes || sha(b) !== f.sha256 || b.length > 25*1024*1024 || b.subarray(0,5).toString() !== '%PDF-') throw Error('PDF hash/size/signature mismatch');
   pending.push([f.path,b]); count++; totalBytes += b.length; anchors += days;
 }
 pending.push([manifestPath,manifestBytes]);
 console.log(JSON.stringify({ year, renderHash, periods: indexes.size, anchors, manifestSha256: sha(manifestBytes) }));
}
if (count !== 56) throw Error('Expected 56 PDFs');
// Verify the entire batch before any copies. Refuse mismatched existing targets.
if (source) {
 for (const [p,b] of pending) {
   try { if (!(await readFile(resolve(root,p))).equals(b)) throw Error(`Existing target differs: ${p}`); }
   catch(e) { if(e.code!=='ENOENT') throw e; }
 }
 for (const [p,b] of pending) {
   const target = resolve(root,p); await mkdir(dirname(target),{recursive:true});
   try { await writeFile(target,b,{flag:'wx'}); } catch(e) { if(e.code!=='EEXIST') throw e; }
 }
}
console.log(`Verified ${count} public PDFs (${totalBytes} bytes), four unchanged manifests, 14 periods/year, 11 font/provenance files. ${source ? 'Copied only allowlisted files; run again without --import to verify destinations.' : 'Destination integrity passed.'}`);
console.log('PDF parse/assembly and dirty-source reproducibility review remain parent release gates; do not merge automatically.');
