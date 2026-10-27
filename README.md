# Sentinel Forward Ledger

Public anchor and verification utilities for the Sentinel Overlay **forward paper record** (前向紙面紀錄).  
本倉庫為**公開**紀錄庫；與主研究倉庫分離。

**Remote (empty, for owner push):** https://github.com/nathan-kw/sentinel-forward-ledger

---

## Purpose | 用途

- **English:** Publish **hashes only** for preregistration and trial artefacts, plus scripts to verify commitment math. Phase 1 does **not** host private log bytes or live portfolio details.
- **中文：** 公開預先登記與試驗產物的**雜湊錨點**（非檔案內容），並提供可重跑的驗證腳本。

### What is published when | 什麼時候公開什麼

| Phase | Content |
|--------|---------|
| **Phase 1 (now)** | `anchors/manifest.json`, `SHA256SUMS`, verification scripts, this README. **No** period records, **no** anchored file bytes. |
| **From 2026-11-02 onward** | Public **projections** of forward records (sealed: no fund codes until reveal). |
| **After period end + compliance** | Reveal may publish picks matching the period-start commitment. |

---

## Provenance & projection states | 狀態說明

From main repo `release/16.5.0` (`periodic-policy.js` `provenanceOf`, `tools/lib/forward-record.mjs` `projectRecord`).

### Record `provenance`

| Value | Meaning |
|--------|---------|
| **`live`** | Written before HKT 12:00 (UTC 04:00) on the period’s first valuation day; decision data strictly before `periodStart`. |
| **`late`** | Recorded but not clean forward evidence (missed window or in-period data). |
| **`backfill`** | Written after `periodEnd` or legacy; not forward evidence. |
| **`missing`** | Deadman gap; no picks/snapshot/optionDecisions. |

### Projection `sealed`

`projection.state: "sealed"` — commitment published; picks withheld until reveal (`forward-record.mjs` L151–L168). Not a `provenance` enum value.

---

## How to verify | 如何驗證

### 1. Anchor manifest (sha256 file hashes)

```bash
shasum -a 256 <downloaded-file>
# compare to anchors/manifest.json "sha256" for that id
node verify/verify-hash.mjs /path/to/file
```

Engine anchor `engine-git-f42d6ac` is a **git commit object id** (`hashKind: gitCommitId`), not a file sha256.

### 2. Commitment hash

```bash
node verify/verify-commitment.mjs record.json
```

Matches main repo: `sealedHash` — `forward-record.mjs` L39–L42; `record.commitment` — `periodic-forward-log.mjs` L364.

### 3. Tests

```bash
node verify/tests/verify-hash.test.mjs
node verify/tests/verify-commitment.test.mjs
```

---

## Limits | 限制

- Local `git commit` dates can be forged; publication time evidence is **GitHub push history** and web archives.
- Hashes prove **byte identity**, not correctness of strategy or data.
- Anchored paths refer to the **private main repo**; bytes are not stored here unless owner mirrors them.

---

## Disclaimer | 免責聲明

**中文：** 以上內容基於公開數據和量化分析，**僅供參考，不構成投資建議**。投資涉及風險，投資需謹慎。任何投資決策應結合個人風險承受能力、資金狀況和投資目標獨立判斷，必要時諮詢持牌專業機構。過往表現不預示未來收益。

**English:** For reference only; **not investment advice**. Past performance does not predict future returns. This ledger does not instruct trading.

---

## Anchor comparison note

Manifest hashes recomputed from `git show release/16.5.0:<path>` on **2026-10-27**. See `anchors/manifest.json` → `anchorComparison` for which ids appear in `docs/grok-trial/anchors-2026-10-26.md` vs anchored here only. Engine commit `f42d6ac…` and `live-mpf-latest.json` are now listed as **hashes only** (still no snapshot bytes in this repo).
