import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { verifyAgainstManifest, loadManifest } from '../verify-hash.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

let pass = 0, fail = 0;
const check = (n, ok) => { if (ok) { pass++; } else { fail++; console.error('FAIL', n); } };

const manifest = loadManifest();
check('manifest has 11 items', manifest.items.length === 11);
check('engine item is gitCommitId hash kind', manifest.items.find(i => i.id === 'engine-git-f42d6ac')?.hashKind === 'gitCommitId');
check('live-mpf item is sha256 hash kind', manifest.items.find(i => i.id === 'live-mpf-latest-json')?.hashKind === 'sha256');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sfl-hash-'));
fs.writeFileSync(path.join(tmp, 'sample.md'), 'synthetic-not-in-manifest');
const bad = verifyAgainstManifest([path.join(tmp, 'sample.md')]);
check('unknown file fails', bad.ok === false);

const sums = fs.readFileSync(path.join(root, 'anchors', 'SHA256SUMS'), 'utf8');
const shaLines = sums.split('\n').filter(l => l && !l.startsWith('#') && !l.startsWith('gitCommitId'));
check('SHA256SUMS has 10 sha256 lines', shaLines.length === 10);
for (const item of manifest.items.filter(i => i.sha256)) {
  check('SHA256SUMS contains ' + item.id, sums.includes(item.sha256));
}
check('SHA256SUMS lists engine commit id', sums.includes('f42d6ac52583cfad310d46116249bec1deeed3f7'));

fs.rmSync(tmp, { recursive: true, force: true });
console.log('verify-hash tests:', pass, 'pass', fail, 'fail');
process.exit(fail ? 1 : 0);
