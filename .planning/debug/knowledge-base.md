# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## missing-button-icons — Icons not rendering on buttons (heroicons silent failure)
- **Date:** 2026-03-24
- **Error patterns:** icons missing, heroicons, i-heroicons, silent rendering failure, CDN, @iconify-json, nuxt-icon-client-bundle, no icons bundled
- **Root cause:** @iconify-json/heroicons package was not installed. With ssr:false, @nuxt/icon defaults to provider:'iconify' (CDN fetch). Since @iconify-json/heroicons was absent, no icons were bundled at build time and the CDN fetch failed silently, leaving all i-heroicons-* icons invisible.
- **Fix:** Run `npm install @iconify-json/heroicons`. The @nuxt/icon module auto-detects local @iconify-json/* packages and bundles their SVG data at build time, eliminating CDN dependency.
- **Files changed:** package.json, package-lock.json
---
