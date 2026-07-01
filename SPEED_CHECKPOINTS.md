# Speed Checkpoints

## surmarketing-speed-known-good-2026-07-01

This checkpoint marks the last known-good speed optimization pass for the unpublished Shopify staging theme `Surmarketing Speed Staging 2026-07-01` (`151265837134`).

Scope:

- Live theme `147936575566` was not changed.
- App embeds remain enabled in `config/settings_data.json`.
- Theme-level optimizations are included: deferred third-party loaders, nonblocking stylesheet loading, LCP image priority hints, section-scoped delivery scripts, and lazy Sur Spotlight loading.
- Raw Lighthouse/PageSpeed evidence is kept locally under `performance-baselines/2026-07-01/` and intentionally excluded from Git because the folder is large.

Use this tag as the rollback point before any further speed experiments.

## surmarketing-speed-delayed-support-apps-2026-07-01

This checkpoint keeps the same staging theme but moves Reamaze and Alia out of the initial rendering path.

Scope:

- Live theme `147936575566` was not changed.
- Reamaze and Alia app embed blocks are disabled in `config/settings_data.json` to avoid duplicate loading.
- Equivalent Reamaze and Alia loaders are added in `layout/theme.liquid` and run after page load/first interaction through `surmarketingLoadAfterReady`.
- A real-browser check confirmed Reamaze scripts, the Reamaze widget, and Alia launcher/app scripts still load after the delay.
- Lighthouse key result versus `surmarketing-speed-known-good-2026-07-01`: average mobile score `+6.0`, average desktop score `+0.0`, average TBT `-185ms`, average transfer `-539KB`.

