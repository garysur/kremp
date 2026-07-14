# KREMP — URL changes (documentation)

**Store:** https://www.kremp.com/  
**Purpose:** Record **old → new** paths for SEO, analytics, and marketing when handles or page structure change. Update this file whenever redirects are decided or imported.

---

## Summary (theme / launch scope)

| Topic | Finding |
|--------|---------|
| **Theme code** | Does **not** define storefront URLs. Paths come from **Shopify handles** (pages, collections, products, blogs) in **Admin**. |
| **Town page redesign** | Switching JSON templates (e.g. `new-town-pages` vs `town-pages`) does **not** change a page’s URL by itself. |
| **Redirect configuration** | **Online Store → Navigation → URL redirects** in Shopify Admin (or CSV import). See [`kremp-launch-redirects.template.csv`](./kremp-launch-redirects.template.csv). |
| **Canonical mapping in repo** | There is **no** checked-in old→new list until the team fills the table below and/or the CSV from a real **sitemap or crawl diff**. |

If **no handles were renamed** for launch, the redirect matrix may be **empty**—still confirm with a quick sitemap or GSC check.

---

## How to verify and document changes

1. **Capture “before” URLs** — Save `https://www.kremp.com/sitemap.xml` and nested sitemaps, or export GSC top pages / a crawl, **before** renames go live.
2. **Capture “after” URLs** — Repeat after launch or handle changes.
3. **Diff** — URLs only in “before” need a **301** to the correct new URL (or a deliberate removal decision).
4. **Record** — Add each pair to the **Confirmed redirects** table below and duplicate rows into `kremp-launch-redirects.template.csv` for import.
5. **Import** — Shopify Admin → URL redirects → Import.

More detail: [`KREMP-launch-url-and-facilities.txt`](./KREMP-launch-url-and-facilities.txt) (section 1–2).

---

## First launch towns (scope — not URL mapping)

These **twelve** markets were called out for the initial town-page roll-out. **Actual paths** depend on each page’s **handle** in Shopify (e.g. `/pages/…`). Confirm in Admin or sitemap; do not assume handles from city names alone.

1. Philadelphia, PA  
2. Doylestown, PA  
3. Glenside, PA  
4. Southampton, PA  
5. Milton, DE  
6. Monument, CO  
7. Farmington, MN  
8. West Chester, PA  
9. Midlothian, TX  
10. Saint Michael, MN  
11. Newark, DE  
12. Hudson, WI  

---

## Confirmed redirects (old → new)

*Add a row for every 301. Use full URLs or paths consistent with your Shopify import format.*

| Old URL or path | New URL or path | Imported to Shopify? (Y/N) | Notes |
|-----------------|-------------------|----------------------------|--------|
| *— none documented in theme repo —* | | | *Fill after sitemap/Admin diff.* |

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| *YYYY-MM-DD* | | *e.g. Added redirects for renamed town pages* |

---

## Related files

| File | Role |
|------|------|
| [`kremp-launch-redirects.template.csv`](./kremp-launch-redirects.template.csv) | Shopify redirect import (header + rows). |
| [`KREMP-launch-url-and-facilities.txt`](./KREMP-launch-url-and-facilities.txt) | Handles, redirects, facility metafield authoring. |
