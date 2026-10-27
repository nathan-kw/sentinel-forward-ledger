# Forward records (phase 1: empty)

Phase 1 **does not publish any period records**. Later, `records/` will hold **projections** copied from the main repository.

## Projection shape (summary)

From `tools/lib/forward-record.mjs` on `release/16.5.0`: log metadata plus `records[]` with `id`, `provenance`, `commitment`, `hash`, `prevHash`, `projection.state` (`sealed` | `revealed` | `legacy`). Sealed projections omit fund-level picks until reveal.

Phase 1 publishes **no** `records/*.json` files.
