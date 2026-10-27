#!/usr/bin/env node
// Standalone commitment / chain helpers (logic from main repo tools/lib/forward-record.mjs).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const ZERO_HASH = '0'.repeat(64);
export const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

/** forward-record.mjs L17–L22 */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
}

/** forward-record.mjs L28–L31, L34–L36 */
export function hashPayload(record) {
  const { hash, outcome, reveal, prevHash, ...rest } = record;
  return rest;
}

export function recordHash(record) {
  return sha256(canonicalJson(hashPayload(record)) + (record.prevHash || ZERO_HASH));
}

/** forward-record.mjs L39–L42 */
export function sealedHash(record) {
  const rec = record.recommendation || {};
  return sha256(canonicalJson({
    picks: rec.picks || null,
    snapshot: record.snapshot || null,
    optionDecisions: record.optionDecisions || null
  }));
}

/** periodic-forward-log.mjs L364 */
export function commitmentForRecord(record, committedAt) {
  return { algo: 'sha256', hash: sealedHash(record), committedAt };
}

/** forward-record.mjs L126–L128 */
export function commitmentMatches(record) {
  if (!record.commitment || record.commitment.hash === undefined) return { ok: false, why: 'no commitment' };
  return { ok: record.commitment.hash === sealedHash(record), expected: sealedHash(record), got: record.commitment.hash };
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  const raw = process.argv[2];
  if (!raw) {
    console.error('Usage: node verify/verify-commitment.mjs <record.json>');
    process.exit(2);
  }
  const text = fs.readFileSync(path.resolve(raw), 'utf8');
  const record = JSON.parse(text);
  const r = commitmentMatches(record);
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}
