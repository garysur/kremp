# Speed Checkpoints

## surmarketing-speed-known-good-2026-07-01

This checkpoint marks the last known-good speed optimization pass for the unpublished Shopify staging theme `Surmarketing Speed Staging 2026-07-01` (`151265837134`).

Scope:

- Live theme `147936575566` was not changed.
- App embeds remain enabled in `config/settings_data.json`.
- Theme-level optimizations are included: deferred third-party loaders, nonblocking stylesheet loading, LCP image priority hints, section-scoped delivery scripts, and lazy Sur Spotlight loading.
- Raw Lighthouse/PageSpeed evidence is kept locally under `performance-baselines/2026-07-01/` and intentionally excluded from Git because the folder is large.

Use this tag as the rollback point before any further speed experiments.

