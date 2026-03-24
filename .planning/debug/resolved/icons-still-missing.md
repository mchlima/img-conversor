---
status: resolved
trigger: "Icons on 'Baixar Todas', 'Remover' (X), and 'Baixar' buttons are STILL not rendering even after installing @iconify-json/heroicons"
created: 2026-03-24T00:00:00Z
updated: 2026-03-24T00:00:00Z
---

## Current Focus

hypothesis: @nuxt/icon clientBundle.scan defaults to false, so even with @iconify-json/heroicons installed no icons are pre-bundled client-side. With ssr:false + nitro static, provider='iconify' (CDN), and the CDN fetch fails silently — the fix is to set icon.clientBundle.scan:true in nuxt.config.ts.
test: Confirmed by reading @nuxt/icon module.mjs source — loadClientBundleCollections() defaults scan:false and userIcons:[] producing empty collections immediately.
expecting: Adding icon: { clientBundle: { scan: true } } to nuxt.config.ts will cause @nuxt/icon to scan .vue files at build time and pre-bundle all discovered heroicons icons.
next_action: User restarts dev server and confirms icons render

## Symptoms

expected: Buttons should display heroicons icons (download, x-mark, archive-box-arrow-down)
actual: Icons are not appearing despite @iconify-json/heroicons being installed
errors: No errors reported — silent failure
reproduction: Open the app, add images, observe buttons — icons missing
started: Since Phase 3/4 implementation. Previous fix (installing @iconify-json/heroicons) was confirmed but icons STILL don't show

## Eliminated

- hypothesis: @iconify-json/heroicons is not installed
  evidence: Package IS installed at node_modules/@iconify-json/heroicons/ with icons.json (626KB). This was the previous session's fix — but incomplete.
  timestamp: 2026-03-24T00:00:00Z

- hypothesis: Wrong icon class names / syntax
  evidence: i-heroicons-archive-box-arrow-down, i-heroicons-arrow-down-tray, i-heroicons-x-mark, i-heroicons-photo are all valid heroicons v2 identifiers. Confirmed present in icons.json. UButton icon prop accepts i-* format.
  timestamp: 2026-03-24T00:00:00Z

- hypothesis: @nuxt/icon module is not present
  evidence: @nuxt/icon IS present in node_modules/@nuxt/. Module is registered via @nuxt/ui which depends on it.
  timestamp: 2026-03-24T00:00:00Z

## Evidence

- timestamp: 2026-03-24T00:00:00Z
  checked: .nuxt/nuxt-icon-client-bundle.mjs
  found: File contains only `export function init() {}` — completely empty despite @iconify-json/heroicons being installed
  implication: @nuxt/icon is not scanning for or bundling any icons client-side

- timestamp: 2026-03-24T00:00:00Z
  checked: .nuxt/nuxt-icon-server-bundle.mjs
  found: File also has empty collections: {} object — no server-side bundling either
  implication: Neither client nor server bundle has any icons

- timestamp: 2026-03-24T00:00:00Z
  checked: @nuxt/icon/dist/module.mjs — loadClientBundleCollections() method
  found: Default value for scan is literally `scan = false`. Without scan:true or an explicit clientBundle.icons list, the method returns {count:0, collections:[], failed:[]} immediately — producing the empty bundle file.
  implication: Installing @iconify-json/heroicons alone is NEVER sufficient. The module must also be told to scan or explicitly list the icons.

- timestamp: 2026-03-24T00:00:00Z
  checked: @nuxt/icon/dist/module.mjs — provider selection logic (line 935)
  found: `options.provider = !nuxt.options.ssr || nuxt.options.nitro.static || nuxt.options._generate ? "iconify" : "server"` — with ssr:false and nitro.static, provider becomes "iconify" (CDN-based)
  implication: With empty client bundle + CDN provider, icons are fetched from cdn.jsdelivr.net at runtime. CDN fetches fail silently (network/timeout/CSP), leaving icons invisible.

- timestamp: 2026-03-24T00:00:00Z
  checked: @nuxt/icon/dist/module.mjs — fallbackToApi default
  found: fallbackToApi defaults to true — but this enables fallback from 'server' provider to CDN, not from 'iconify' provider. With ssr:false, provider IS already 'iconify' (CDN). So fallbackToApi provides no additional help.
  implication: The only reliable fix for a static app is to pre-bundle icons at build time.

- timestamp: 2026-03-24T00:00:00Z
  checked: nuxt.config.ts
  found: No icon configuration block exists at all — all defaults apply
  implication: Adding icon: { clientBundle: { scan: true } } will enable auto-discovery of all i-heroicons-* usages in .vue files and pre-bundle them.

## Resolution

root_cause: @nuxt/icon's clientBundle.scan defaults to false. With ssr:false + nitro.static, the provider is set to "iconify" (CDN). Since clientBundle.icons is empty and scan is disabled, nuxt-icon-client-bundle.mjs is always generated empty. At runtime the module attempts CDN fetches which fail silently — icons never render. Installing @iconify-json/heroicons is a prerequisite but insufficient alone; the scan or explicit icon list must also be configured.
fix: Add icon: { clientBundle: { scan: true } } to nuxt.config.ts. This enables @nuxt/icon to scan all .vue files at build time, discover i-heroicons-* usages, and pre-bundle the needed SVG data into nuxt-icon-client-bundle.mjs, eliminating the CDN dependency.
verification: confirmed by user — icons render correctly in browser after adding icon.clientBundle.scan:true to nuxt.config.ts
files_changed:
  - nuxt.config.ts
