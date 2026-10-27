import { recordHash, sealedHash, commitmentForRecord, commitmentMatches, ZERO_HASH } from '../verify-commitment.mjs';

let pass = 0, fail = 0;
const check = (n, ok, d = '') => { if (ok) pass++; else { fail++; console.error('FAIL', n, d); } };

const record = {
  id: 'FWD-TEST-20261102-monthly-primary',
  asOf: '2026-11-02',
  dataAsOf: '2026-10-29',
  frequency: 'monthly',
  option: 'synthetic',
  role: 'primary',
  provenance: 'live',
  writtenAt: '2026-11-01T20:00:00.000Z',
  recommendation: {
    periodStart: '2026-11-02',
    periodEnd: '2026-12-01',
    picks: [{ code: 'TEST-A', zh: 'Synthetic fund A', w: 70, role: 'main' }, { code: 'TEST-B', zh: 'Synthetic fund B', w: 30, role: 'satellite' }]
  },
  snapshot: { asOf: '2026-10-29', poolSize: 2 },
  optionDecisions: { primary: [{ code: 'TEST-A', w: 70 }] },
  prevHash: ZERO_HASH
};
record.commitment = commitmentForRecord(record, record.writtenAt);
record.hash = recordHash(record);

const m = commitmentMatches(record);
check('synthetic commitment matches sealedHash', m.ok, JSON.stringify(m));

record.commitment.hash = '0'.repeat(64);
check('tampered commitment fails', commitmentMatches(record).ok === false);

const h1 = sealedHash(record);
const h2 = sealedHash(record);
check('sealedHash deterministic', h1 === h2);

console.log('verify-commitment tests:', pass, 'pass', fail, 'fail');
process.exit(fail ? 1 : 0);
