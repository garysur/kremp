# Speed Checkpoints

## surmarketing-new-theme-staging-first-pass-2026-07-14

This checkpoint marks the first speed pass on the July 2026 town-page redesign export in the unpublished Shopify staging theme `Surmarketing Speed Staging 2026-07-01` (`151265837134`).

Scope:

- Live theme `151109730382` was not changed.
- Baseline Lighthouse reports were captured from the untouched live new theme before uploading this export to staging.
- Staging theme `151265837134` was updated with the optimized export from `theme_export__www-kremp-com-town-page-redesign`.
- Applied recommendation items include duplicate jQuery/override cleanup, route-gated delivery scripts and data, delayed support/app loaders, nonblocking secondary CSS, product layout reservation, and delivery attribute synchronization before add-to-cart.
- Theme Check still reports pre-existing theme offenses, but the modified files had zero Theme Check offenses in the JSON check.
- Product add-to-cart QA passed on staging with zip `19046`, selected date `Jul 14, 2026`, cart item `Holiday Bloom Fruit Basket`, and cart attributes `deliveryDate`, `zipCode`, and `shippingType`.
- Delayed Reamaze, Alia, rlets, and GTM scripts were confirmed to load after the delayed loader.
- Lighthouse first-pass result versus the live new-theme baseline: average score `62.8 -> 72.4`, mobile average `40.4 -> 52.6`, desktop average `85.2 -> 92.2`, average LCP improved by about `1.1s`, average TBT improved by about `228ms`, average transfer dropped by about `1.0MB`, and average requests dropped by about `39`.
- Product mobile remains noisy in lab testing: repeated staging runs scored `41`, `45`, and `62`, so use multiple runs or field data before calling that page solved.
- Raw Lighthouse evidence is kept locally under `performance-baselines/2026-07-14/` and intentionally excluded from Git because the folder is large.

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

## surmarketing-speed-css-reserve-and-delivery-sync-2026-07-01

This checkpoint keeps the same staging theme and focuses on lower-risk render/layout improvements plus delivery-form stability.

Scope:

- Live theme `147936575566` was not changed.
- Staging theme `151265837134` was updated only through targeted theme pushes.
- Flatpickr and animation CSS no longer block initial rendering.
- Product desktop reserves space for the zip/date panel and action area to reduce layout shifts.
- Delivery date and zip hidden cart attributes are synchronized before add-to-cart, and the existing zip clear routine no longer wipes active shopper selections.
- Product add-to-cart QA passed on staging with zip `19046`, selected date `Jul 02, 2026`, cart item `Holiday Bloom Fruit Basket`, and cart attributes `deliveryDate`, `zipCode`, and `shippingType`.
- Lighthouse result versus `surmarketing-speed-delayed-support-apps-2026-07-01`: average score `+1.4`, desktop average score `+3.6`, mobile average score `-0.8`, average LCP `-1112ms`. Product desktop improved `84 -> 90`; About mobile improved `47 -> 55`; product mobile remains app/checkout-script constrained.
