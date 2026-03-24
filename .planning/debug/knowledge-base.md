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

## icons-still-missing — @nuxt/icon clientBundle.scan disabled causes empty icon bundle and silent CDN failure
- **Date:** 2026-03-24
- **Error patterns:** icons missing, heroicons, i-heroicons, clientBundle, nuxt-icon-client-bundle empty, scan false, CDN silent failure, ssr:false, static, @iconify-json installed but no icons
- **Root cause:** @nuxt/icon's clientBundle.scan defaults to false. With ssr:false + nitro.static, the provider is forced to "iconify" (CDN). Since scan is off and no explicit icon list was configured, nuxt-icon-client-bundle.mjs is generated empty at every build. At runtime the module attempts CDN fetches which fail silently — icons never render. Installing @iconify-json/heroicons is a prerequisite but insufficient alone.
- **Fix:** Add `icon: { clientBundle: { scan: true } }` to nuxt.config.ts. This enables @nuxt/icon to scan all .vue files at build time, discover i-heroicons-* usages, and pre-bundle the required SVG data, eliminating the CDN dependency entirely.
- **Files changed:** nuxt.config.ts
---
