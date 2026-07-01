# Speed Recomendations

Audit date: 2026-06-26

This is a static performance audit of the Shopify theme source in this folder. I scanned all 402 files with `rg --files`, then checked the high-impact Liquid, JavaScript, CSS, template JSON, app embed, media, and global layout patterns. Expected savings are estimates until they are validated against a live Shopify preview with Lighthouse, PageSpeed Insights, Shopify Web Performance reports, and Chrome DevTools Coverage.

Core Web Vitals targets used for prioritization:

- LCP: 2.5s or less at the 75th percentile.
- INP: 200ms or less at the 75th percentile.
- CLS: 0.1 or less at the 75th percentile.

Primary references:

- Shopify theme performance best practices: https://shopify.dev/docs/storefronts/themes/best-practices/performance
- Shopify `AssetPreload` guidance: https://shopify.dev/docs/storefronts/themes/tools/theme-check/checks/asset-preload
- Web Vitals thresholds: https://web.dev/articles/vitals
- Effective CWV fixes: https://web.dev/articles/top-cwv

## Highest Impact Tasks

| Priority | Task | Expected savings | Primary files |
| --- | --- | --- | --- |
| 1 | Split, remove, or route-gate the override mega-bundles. `overrides.js`, `overrides_new.js`, and `override_new24-6.js` are each about 1.5 MB raw. `layout/theme.liquid` loads an unqualified `overrides.js` for non-product pages and later loads the Shopify asset version too. Confirm which file is current, delete stale copies, and create route-specific chunks instead of one large global bundle. | Up to 1.5 MB raw JS per affected page immediately if duplicate load is removed; up to 3.0 MB raw cleanup if stale copies are removed; likely 500ms-2s less mobile parse/compile pressure on slow devices. | `layout/theme.liquid:441`, `layout/theme.liquid:1394`, `layout/theme.liquid:1397`, `assets/overrides.js`, `assets/overrides_new.js`, `assets/override_new24-6.js` |
| 2 | Audit and defer third-party/app embeds. Current settings include many active embeds: Klaviyo, kbite, Appstle, Shopify Forms, EPA product addons, Optis/BSS options, Judge.me, Alia, Schema Plus, Upcart, StockIQ, Reamaze, Microsoft Clarity, JSON-LD, MerchantWidget, GTM, and rlets. Duplicate rlets capture scripts appear in the layout. Keep only revenue-critical tags on first load; move chat/reviews/widgets to interaction or below-the-fold triggers. | Commonly 300 KB-2 MB less third-party transfer and 500ms-3s less main-thread work, depending on which embeds are active in production. Strong INP and LCP upside. | `config/settings_data.json`, `layout/theme.liquid:25`, `layout/theme.liquid:446`, `layout/theme.liquid:809`, `templates/product.json`, `templates/collection.json`, `templates/index.json` |
| 3 | Route-gate ZIP, date, delivery, and holiday logic. Large inline blocks in the global layout create cart/PDP behavior on every page, including zip arrays, metaobject loops, local zip data, holiday-disable data, checkout validation, and Upcart hooks. Move these into product/cart-only snippets or JSON endpoints and lazy-load them when the ZIP/date UI exists. | 50-300 KB less HTML/inline JS on non-PDP pages; 100-600ms less parse/runtime work; better INP from fewer global handlers and observers. | `layout/theme.liquid:57-427`, `layout/theme.liquid:989-1391`, `layout/theme.liquid:1406-1599`, `layout/theme.liquid:1752-2092`, `snippets/wfl__zip-n-cal.liquid`, `snippets/wfl_zip_processor.liquid`, `sections/wfl__collection-evalutate-zip.liquid` |
| 4 | Remove duplicated parser-blocking jQuery. The layout loads jQuery 3.7.1 and 3.6.0 without `defer`, before the theme's own deferred JS. Either remove jQuery by converting handlers to native DOM APIs or load one version only, deferred, on templates that still need it. | About 30-90 KB compressed transfer per duplicate external request, two fewer blocking network requests, and often 100-300ms faster FCP/LCP on mobile. | `layout/theme.liquid:55`, `layout/theme.liquid:215` |
| 5 | Replace polling and broad `MutationObserver` usage. The layout scans the entire body to fix mojibake text, watches the whole body for Upcart rerenders, and polls every 100ms on cart. Replace with scoped observers, event hooks, or one-shot initialization. Remove production `console.log` calls. | 50-250ms less INP risk during interactions; removes continuous CPU work and improves battery/thermal behavior on mobile. | `layout/theme.liquid:170-205`, `layout/theme.liquid:1502-1539`, `layout/theme.liquid:1871-1948`, `layout/theme.liquid:2084-2090` |
| 6 | Add explicit LCP image priority through the shared image snippet. `snippets/image.liquid` already centralizes responsive images, but it cannot emit `fetchpriority="high"`, `decoding`, or Shopify `image_tag: preload: true` style hints. Add a `priority` or `preload` parameter and use it only for first-section hero images, first product media, and first collection card. | 200-800ms LCP improvement on pages where the hero/product image is the LCP element. | `snippets/image.liquid`, `sections/navigation-slideshow.liquid:186-209`, `sections/image-banner.liquid`, `sections/main-product.liquid`, `sections/main-collection-products.liquid`, `snippets/product-card.liquid` |
| 7 | Reduce render-blocking CSS on initial routes. `main.css` is 116.9 KB raw and `overrides.css` is 19.2 KB raw, both loaded globally. `simple-notify.css` is also global. Keep only above-the-fold critical styles blocking, move route-only CSS into section-scoped loading, and prefer Shopify `stylesheet_tag: preload: true` for selected critical CSS over manual preload links. | 20-80 KB less initial CSS on many pages; 100-400ms FCP/LCP improvement on mobile if unused global CSS is trimmed. | `layout/theme.liquid:461`, `layout/theme.liquid:729-731`, `assets/main.css`, `assets/overrides.css`, `assets/simple-notify.css`, section CSS includes |
| 8 | Simplify font loading. The layout preconnects to Google Fonts and loads Cormorant Upright while also using Shopify font settings and preloading body/heading fonts. Pick one strategy: Shopify-hosted fonts or system fonts are best for speed. Avoid loading Google CSS and multiple heading font sources together. | 20-90 KB less font/CSS transfer, one or two fewer third-party connections, and 100-500ms less LCP/CLS risk from late font swaps. | `layout/theme.liquid:454-458`, `layout/theme.liquid:502-508`, `layout/theme.liquid:580`, `layout/theme.liquid:734-754`, `config/settings_data.json` |
| 9 | Remove review/app widgets from every product card. `snippets/product-card.liquid` renders Judge.me preview badge markup for every card and has Yotpo markup behind settings. On collection and search grids this multiplies DOM size and app work. Render static rating metafields first; hydrate third-party widgets only when a card enters the viewport or on PDP. | 100-500ms less collection/search INP work and fewer DOM nodes; app script savings depend on the review provider. | `snippets/product-card.liquid:200-225`, `templates/product.json`, `templates/product.fig-toggle-template.json`, `templates/product.fig-time.json`, `templates/collection.json` |
| 10 | Lazy-load video and iframe embeds with real placeholders. Several page templates and sections include YouTube/external video settings, autoplay video sections, or raw iframe custom Liquid. Use thumbnail placeholders with click-to-load for YouTube and avoid autoplay except for muted decorative video below the fold. | 500 KB-1.5 MB less third-party/media transfer on video pages; 300ms-1s less main-thread/network contention; lower CLS if placeholders reserve aspect ratio. | `sections/video.liquid`, `sections/background-video.liquid`, `sections/media-with-text.liquid`, `sections/media-grid.liquid`, `sections/promo-grid.liquid`, `snippets/promo-image.liquid`, `templates/page.townpageyoutube.json`, `templates/page.town-pages.json`, `templates/page.about.json` |
| 11 | Move large custom-Liquid content out of first-load HTML where possible. Some JSON templates contain large inline tables, inline styles, generated product rows, and town-page resource blocks. Keep SEO-critical copy server-rendered, but paginate/accordion/defer large tables and below-the-fold custom sections. | 20-120 KB less HTML and faster DOM parse on affected informational pages. | `templates/page.the-best-and-worst-state.json`, `templates/page.most-common-birthday-mont.json`, `templates/page.town-pages.json`, `templates/page.townpageyoutube.json`, `templates/page.delivery-all-states.json`, `templates/agents.md.liquid` |
| 12 | Deduplicate section asset loading. Many sections/snippets emit the same script tags (`custom-select.js`, `quick-add.js`, `variant-picker.js`, `product-form.js`, `video.js`, `slideshow.js`). Browser cache helps transfer, but duplicate tags can still execute more than once and add parse/init work. Add a small asset include guard or central route-level loader. | 10-100ms less JS init work on section-heavy pages; avoids duplicate custom element registration and duplicate event listeners. | `sections/featured-collection.liquid`, `sections/product-recommendations.liquid`, `sections/recently-viewed.liquid`, `sections/main-search.liquid`, `sections/main-collection-products.liquid`, `snippets/recommendations.liquid`, `sections/navigation-slideshow.liquid` |
| 13 | Review animation and interaction settings. The current theme enables animations on mobile and desktop. Disable mobile animations first, avoid layout-affecting transitions, and make sticky cart/header behaviors transform-only. | 20-150ms less render work during scroll and interactions; lower CLS risk on animated sections and banners. | `config/settings_data.json`, `assets/animate-on-scroll.js`, `assets/animate-on-scroll.css`, `assets/main.js`, `sections/slideshow.liquid`, `sections/testimonials.liquid` |
| 14 | Clean unused assets and source maps from deployable theme assets. `override_new24-6.js` is 1.5 MB and does not appear to be referenced. Source maps are present in assets. Remove after confirming they are not needed in production theme deploys. | Up to 1.6 MB less theme asset footprint; 0 KB direct page saving unless a removed asset is currently requested. | `assets/override_new24-6.js`, `assets/overrides.js.map`, `assets/overrides.css.map`, duplicate favicon assets |
| 15 | Add automated performance checks. Run Shopify Theme Check, Lighthouse mobile on home/product/collection, Chrome Coverage, and Shopify Theme Inspector. Use the Shopify weighted speed score formula for home/product/collection when benchmarking. | No direct KB saving, but prevents regressions and validates that the estimated savings above land in field/lab data. | Whole theme |

## Audit Summary

- Total files scanned: 402.
- Directory counts: `assets` 135, `config` 5, `layout` 2, `locales` 8, `sections` 84, `snippets` 113, `templates` 55.
- Extension counts: `.liquid` 202, `.js` 59, `.css` 62, `.json` 63, `.map` 2, images/icons 11, other docs/config 3.
- Asset payload: JS is the largest local asset class at about 4.8 MB raw. CSS is about 387 KB raw.
- `layout/theme.liquid` has 20 inline script blocks, 13 external script tags, 9 stylesheet links, 54 `console.log` calls, 3 `setInterval` occurrences, and 2 broad `MutationObserver` occurrences.

Largest local files by raw size:

| File | Raw size |
| --- | --- |
| `assets/overrides_new.js` | 1507.3 KB |
| `assets/overrides.js` | 1507.2 KB |
| `assets/override_new24-6.js` | 1500.9 KB |
| `templates/agents.md.liquid` | 244.0 KB |
| `assets/overrides.js.map` | 131.7 KB |
| `assets/main.css` | 116.9 KB |
| `assets/main.js` | 88.7 KB |
| `sections/header.liquid` | 85.6 KB |
| `sections/main-product.liquid` | 84.8 KB |
| `layout/theme.liquid` | 74.9 KB |
| `assets/password.css` | 69.3 KB |

## Suggested Execution Order

1. Fix the override bundle loading and duplicate jQuery first. This is the clearest payload and render-blocking win.
2. Gate third-party apps, rlets, MerchantWidget, and ZIP/date scripts by route or interaction.
3. Add LCP image priority for first-section hero/product/collection images.
4. Trim render-blocking CSS and font loading.
5. Defer review widgets, videos, custom Liquid blocks, and repeated section assets.
6. Run Theme Check, Lighthouse mobile, Shopify Web Performance reports, and Chrome Coverage after each batch.

## Page-Type Notes

Home page:

- Hero is `templates/index.json` plus `sections/navigation-slideshow.liquid`.
- Prioritize the first hero image with `fetchpriority="high"` or Shopify image preload.
- Avoid initializing quick-nav, slideshow, app review carousel, and video work before the hero is painted.

Product pages:

- Highest risk is the 1.5 MB `overrides_new.js` bundle plus global delivery-date/ZIP logic.
- Product media can become LCP, so first product image should be eager and high priority.
- App blocks for product options, addons, and review widgets should be audited carefully.

Collection/search pages:

- Product card grids are sensitive to DOM size, review widgets, and image lazy/eager balance.
- First product card is already set up to avoid lazy loading in `main-collection-products`, but the shared image snippet needs a priority option.
- Disable third-party review hydration in card grids unless it is proven to help conversion.

Town/content pages:

- Large JSON templates and custom Liquid sections can inflate HTML and DOM parse time.
- YouTube and weather widgets should be click/viewport loaded.
- Keep hero images responsive and prioritized; lazy-load all below-the-fold media.

## File Coverage

The following files were included in the static scan. Files not named in the priority table did not show a major CWV issue from source inspection alone, or they are small supporting assets whose impact is indirect.

```text
assets\age-verification-pop-up.js
assets\animate-on-scroll.css
assets\animate-on-scroll.js
assets\announcement.css
assets\announcement.js
assets\article-pagination.css
assets\article-pagination.js
assets\article.css
assets\blog-filter.js
assets\blog.css
assets\blur-messages.js
assets\bullet-checkbark.svg
assets\cart-drawer.js
assets\cart-items.css
assets\cart-items.js
assets\cart-note.js
assets\cart-summary.css
assets\cart-terms.js
assets\collection-banner.css
assets\compare-drawer.js
assets\compare-modal.js
assets\compare-toggle.css
assets\countdown-timer.js
assets\country-province-selector.js
assets\custom-pagination.js
assets\custom-select.js
assets\custom.js
assets\customer-addresses.js
assets\customer.css
assets\details-modal.js
assets\discount-code.css
assets\discount-code.js
assets\facet-filters.css
assets\facet-filters.js
assets\favicon-16x16.png
assets\favicon-16x16.webp
assets\favicon-32x32.png
assets\favicon-32x32.webp
assets\favicon.ico
assets\featured-collection.css
assets\footer.css
assets\gallery-mobile-carousel.css
assets\gallery.css
assets\gift-card-recipient.css
assets\gift-card-recipient.js
assets\gift-card.css
assets\hotspots-image.css
assets\hotspots-image.js
assets\icon_cal.svg
assets\icon_info.svg
assets\icon_step-1.svg
assets\icon_step-2.svg
assets\icon_step-3.svg
assets\icons-with-text.css
assets\instant-page.js
assets\main.css
assets\main.js
assets\media-gallery.css
assets\media-gallery.js
assets\media-with-text.css
assets\modal.css
assets\modal.js
assets\model-viewer.css
assets\navigation-mega-columns.css
assets\navigation-mega-pills.css
assets\navigation-mega-sidebar.css
assets\navigation-promos.css
assets\new-town-pages.css
assets\override_new24-6.js
assets\overrides_new.js
assets\overrides.css
assets\overrides.css.map
assets\overrides.js
assets\overrides.js.map
assets\password.css
assets\pickup-availability.js
assets\pop-up.js
assets\popup.css
assets\predictive-search.css
assets\predictive-search.js
assets\price-range.css
assets\price-range.js
assets\product-compare.css
assets\product-comparison-grid.css
assets\product-comparison-grid.js
assets\product-form.js
assets\product-highlights.css
assets\product-inventory.css
assets\product-inventory.js
assets\product-message.css
assets\product-message.js
assets\product-model.js
assets\product-page.css
assets\product-recommendations.js
assets\product-type-search.css
assets\product.css
assets\products-grid.css
assets\products-toolbar.js
assets\promo-strip.css
assets\promos.css
assets\quantity-input.css
assets\quantity-input.js
assets\quick-add.css
assets\quick-add.js
assets\quick-nav-large.css
assets\quick-nav-price.css
assets\quick-nav.css
assets\quick-nav.js
assets\reviews.css
assets\search-form.js
assets\search-suggestions.css
assets\shipping-calculator.js
assets\shoppable-image.js
assets\side-drawer.js
assets\simple-notify.css
assets\simple-notify.min.js
assets\slider.js
assets\slideshow-quick-nav.css
assets\slideshow.css
assets\slideshow.js
assets\speech-search.css
assets\speech-search.js
assets\sticky-atc-panel.css
assets\sticky-atc-panel.js
assets\sticky-scroll-direction.js
assets\swatches.css
assets\swatches.css.liquid
assets\tabs.js
assets\testimonials.css
assets\text-overlay.css
assets\theme-editor.js
assets\variant-label.js
assets\variant-picker.js
assets\video.css
assets\video.js
config\kremp-launch-redirects.template.csv
config\KREMP-launch-url-and-facilities.txt
config\KREMP-URL-CHANGES.md
config\settings_data.json
config\settings_schema.json
layout\password.liquid
layout\theme.liquid
locales\de.json
locales\en.default.json
locales\es.json
locales\fr.json
locales\it.json
locales\ja.json
locales\nl.json
locales\pt-PT.json
sections\age-verification-popup.liquid
sections\announcement.liquid
sections\apps.liquid
sections\article-comments.liquid
sections\background-video.liquid
sections\cart-drawer.liquid
sections\cart-icon-bubble.liquid
sections\collection-list.liquid
sections\collections-faq.liquid
sections\contact-form.liquid
sections\countdown-timer.liquid
sections\country-selector.liquid
sections\custom-liquid.liquid
sections\details-section-kremp.liquid
sections\faq.liquid
sections\featured-blog.liquid
sections\featured-collection.liquid
sections\featured-product.liquid
sections\fig-toggle-template.liquid
sections\footer-group.json
sections\footer.liquid
sections\free-shipping-notice.liquid
sections\header-group.json
sections\header.liquid
sections\icons-with-text.liquid
sections\image-banner.liquid
sections\link-lists.liquid
sections\logo-list.liquid
sections\main-404.liquid
sections\main-account.liquid
sections\main-activate_account.liquid
sections\main-addresses.liquid
sections\main-article.liquid
sections\main-blog.liquid
sections\main-cart.liquid
sections\main-collection-banner.liquid
sections\main-collection-products.liquid
sections\main-contact.liquid
sections\main-gift-card.liquid
sections\main-list-collections.liquid
sections\main-login.liquid
sections\main-order.liquid
sections\main-page.liquid
sections\main-password-header.liquid
sections\main-password.liquid
sections\main-product.liquid
sections\main-product02-05.liquid
sections\main-register.liquid
sections\main-reset_password.liquid
sections\main-search.liquid
sections\media-grid.liquid
sections\media-with-text.liquid
sections\metafield-faq.liquid
sections\metafield-link-columns.liquid
sections\metafield-location-grid.liquid
sections\multi-column-v2.liquid
sections\multi-column.liquid
sections\navigation-slideshow.liquid
sections\new-fig-time.liquid
sections\newsletter.liquid
sections\order-conflict-popup.liquid
sections\order-tracking.liquid
sections\overlay-group.json
sections\pickup-availability.liquid
sections\pop-up.liquid
sections\predictive-search.liquid
sections\product-compare-basket.liquid
sections\product-compare.liquid
sections\product-comparison-grid.liquid
sections\product-details.liquid
sections\product-features.liquid
sections\product-recommendations.liquid
sections\promo-grid.liquid
sections\promo-strip.liquid
sections\recently-viewed.liquid
sections\rich-text.liquid
sections\scrolling-banner.liquid
sections\shoppable-image.liquid
sections\slideshow.liquid
sections\testimonials.liquid
sections\town-products.liquid
sections\town-weather.liquid
sections\video.liquid
sections\wfl__collection-evalutate-zip.liquid
snippets\article-card.liquid
snippets\backorder.liquid
snippets\breadcrumbs.liquid
snippets\cart-drawer.liquid
snippets\cart-items.liquid
snippets\collection-card.liquid
snippets\compare-swatches.liquid
snippets\countdown-timer.liquid
snippets\custom-select.liquid
snippets\doc-head-core.liquid
snippets\doc-head-social.liquid
snippets\facet-filters.liquid
snippets\free-shipping-notice.liquid
snippets\gift-card-recipient.liquid
snippets\icon-3d-model.liquid
snippets\icon-add-to-cart.liquid
snippets\icon-arrow-in-circle.liquid
snippets\icon-arrow-left.liquid
snippets\icon-arrow-right.liquid
snippets\icon-available.liquid
snippets\icon-bag.liquid
snippets\icon-basket-2.liquid
snippets\icon-basket.liquid
snippets\icon-cart.liquid
snippets\icon-check.liquid
snippets\icon-chevron-down.liquid
snippets\icon-chevron-left.liquid
snippets\icon-chevron-right.liquid
snippets\icon-close.liquid
snippets\icon-copy.liquid
snippets\icon-customer-2.liquid
snippets\icon-customer.liquid
snippets\icon-discord.liquid
snippets\icon-facebook.liquid
snippets\icon-filter.liquid
snippets\icon-grid.liquid
snippets\icon-instagram.liquid
snippets\icon-linkedin.liquid
snippets\icon-list.liquid
snippets\icon-mastodon.liquid
snippets\icon-mic.liquid
snippets\icon-padlock.liquid
snippets\icon-pause.liquid
snippets\icon-pinterest.liquid
snippets\icon-play.liquid
snippets\icon-plus.liquid
snippets\icon-rss.liquid
snippets\icon-search.liquid
snippets\icon-snapchat.liquid
snippets\icon-spotify.liquid
snippets\icon-tags.liquid
snippets\icon-threads.liquid
snippets\icon-tiktok.liquid
snippets\icon-trash.liquid
snippets\icon-tumblr.liquid
snippets\icon-twitch.liquid
snippets\icon-twitter-bird.liquid
snippets\icon-twitter.liquid
snippets\icon-unavailable.liquid
snippets\icon-video.liquid
snippets\icon-vimeo.liquid
snippets\icon-wechat.liquid
snippets\icon-whatsapp.liquid
snippets\icon-youtube.liquid
snippets\icon.liquid
snippets\image.liquid
snippets\localization-form.liquid
snippets\media-gallery.liquid
snippets\multiline-text.liquid
snippets\newsletter-signup.liquid
snippets\pagination.liquid
snippets\pickup-availability.liquid
snippets\predictive-search-tab-button.liquid
snippets\predictive-search-tab-panel.liquid
snippets\predictive-search.liquid
snippets\price-as-money.liquid
snippets\price-range.liquid
snippets\price.liquid
snippets\product-card-mini.liquid
snippets\product-card.liquid
snippets\product-compare.liquid
snippets\product-inventory.liquid
snippets\product-label.liquid
snippets\product-media.liquid
snippets\product-popups.liquid
snippets\product-weight.liquid
snippets\products-toolbar.liquid
snippets\promo-card.liquid
snippets\promo-image.liquid
snippets\promoted-products.liquid
snippets\quantity-input.liquid
snippets\quick-add-drawer.liquid
snippets\quick-nav-select.liquid
snippets\quick-nav.liquid
snippets\rating.liquid
snippets\recommendations.liquid
snippets\render-metafield.liquid
snippets\shipping-calculator.liquid
snippets\sizes-attribute.liquid
snippets\social-media.liquid
snippets\social-share.liquid
snippets\structured-data-article.liquid
snippets\structured-data-header.liquid
snippets\structured-data-product.liquid
snippets\town-weather.liquid
snippets\variant-picker-fig.liquid
snippets\variant-picker.liquid
snippets\wfl__zip-n-cal.liquid
snippets\wfl_zip_processor.liquid
snippets\wfl-action-area-mobile.liquid
snippets\wfl-action-area.liquid
snippets\wfl-action-area02-05.liquid
snippets\wfl-complementary.liquid
templates\404.json
templates\agents.md.liquid
templates\article.json
templates\blog.json
templates\cart.json
templates\collection.flash-sale.json
templates\collection.json
templates\customers\account.json
templates\customers\activate_account.json
templates\customers\addresses.json
templates\customers\login.json
templates\customers\order.json
templates\customers\register.json
templates\customers\reset_password.json
templates\gift_card.liquid
templates\index.json
templates\list-collections.json
templates\page.about.json
templates\page.awards-recognitions.json
templates\page.become-an-affiliate.json
templates\page.contact.json
templates\page.delivery-all-states.json
templates\page.faqs.json
templates\page.florist-of-the-year.json
templates\page.flower-plant-fundraising.json
templates\page.Forms - Chuppah or Arch Rental Form.json
templates\page.Forms - kinkade.json
templates\page.Forms - Plant Rental Form.json
templates\page.Forms - test.json
templates\page.Forms - Wedding Consultation Form.json
templates\page.gallery.json
templates\page.happy-customers.json
templates\page.json
templates\page.legal.json
templates\page.lookbook.json
templates\page.most-common-birthday-mont.json
templates\page.new-town-pages.json
templates\page.state-pages.json
templates\page.store-location.json
templates\page.the-best-and-worst-state.json
templates\page.town-pages.json
templates\page.townpageyoutube.json
templates\page.track-your-order.json
templates\password.json
templates\product.coming-soon.json
templates\product.countdown.json
templates\product.fig-time.json
templates\product.fig-toggle-template.json
templates\product.figs-sold-out.json
templates\product.json
templates\product.preorder.json
templates\product.spicegems-addon.liquid
templates\robots.txt.liquid
templates\search.bss.po.liquid
templates\search.json
```
