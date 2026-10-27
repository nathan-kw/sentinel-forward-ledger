#!/usr/bin/env node
// Verify file SHA-256 against anchors/manifest.json (no network, no deps).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(root, 'anchors', 'manifest.json');

export function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export function loadManifest(manifestPath = MANIFEST) {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

/** @returns {{ ok: boolean, problems: string[] }} */
export function verifyAgainstManifest(files, manifestPath = MANIFEST) {
  const manifest = loadManifest(manifestPath);
  const byHash = new Map(manifest.items.filter(i => i.sha256).map(i => [i.sha256, i]));
  const problems = [];
  for (const f of files) {
    if (!fs.existsSync(f)) {
      problems.push(f + ': file missing');
      continue;
    }
    const h = sha256File(f);
    const item = byHash.get(h);
    if (!item) problems.push(f + ': sha256 ' + h + ' not in manifest');
  }
  return { ok: problems.length === 0, problems };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Usage: node verify/verify-hash.mjs <file> [file...]');
    console.error('  Compares each file hash to anchors/manifest.json sha256 entries.');
    process.exit(2);
  }
  const r = verifyAgainstManifest(args.map(p => path.resolve(p)));
  if (r.ok) {
    console.log(JSON.stringify({ ok: true, checked: args.length }));
    process.exit(0);
  }
  console.log(JSON.stringify({ ok: false, problems: r.problems }, null, 2));
  process.exit(1);
}
