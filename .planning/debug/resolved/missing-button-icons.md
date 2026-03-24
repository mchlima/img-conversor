---
status: resolved
trigger: "Icons on DownloadAllButton, ImageCard X button, and ImageCard download button are not rendering"
created: 2026-03-24T00:00:00Z
updated: 2026-03-24T00:00:00Z
---

## Current Focus

hypothesis: @iconify-json/heroicons is not installed; @nuxt/icon defaults to provider:'iconify' (CDN fetch) when ssr:false, and the CDN fetch fails silently in static builds — no icons bundled
test: Confirmed by reading nuxt-icon-client-bundle.mjs (empty) and verifying @iconify-json/heroicons is absent from node_modules
expecting: Installing @iconify-json/heroicons will populate the bundle and icons will render
next_action: Run npm install @iconify-json/heroicons

## Symptoms

expected: Buttons display icons (i-heroicons-archive-box-arrow-down, i-heroicons-arrow-down-tray, i-heroicons-x-mark, i-heroicons-photo)
actual: Icons are not appearing on any button
errors: No errors reported — silent rendering failure
reproduction: Open the app, add images, observe buttons missing icons
started: Since Phase 3/4 implementation

## Eliminated

- hypothesis: Wrong icon class names (typo in i-heroicons-* strings)
  evidence: Class names match valid heroicons v2 identifiers; UIcon also uses same prefix; no typos detected
  timestamp: 2026-03-24T00:00:00Z

- hypothesis: Nuxt UI component API mismatch (icon prop not supported)
  evidence: @nuxt/ui v4 UButton and UIcon both accept icon prop with i-* format; usage is correct
  timestamp: 2026-03-24T00:00:00Z

- hypothesis: @iconify/collections missing heroicons metadata
  evidence: heroicons key is present in @iconify/collections/collections.json — metadata exists, but that package contains only metadata, not SVG data
  timestamp: 2026-03-24T00:00:00Z

## Evidence

- timestamp: 2026-03-24T00:00:00Z
  checked: node_modules/@iconify-json/ directory
  found: Directory does not exist — no @iconify-json/* packages installed at all
  implication: No local icon SVG data available for any collection

- timestamp: 2026-03-24T00:00:00Z
  checked: @nuxt/icon source (dist/*.mjs)
  found: When ssr:false, provider defaults to 'iconify' (CDN-based). Local bundling only happens when @iconify-json/<collection> or @iconify/json is present. CDN URL: https://cdn.jsdelivr.net/npm/@iconify-json/${name}/icons.json
  implication: With no local package, runtime must reach Iconify CDN. In static/offline context this fails silently.

- timestamp: 2026-03-24T00:00:00Z
  checked: .nuxt/nuxt-icon-client-bundle.mjs
  found: File contains only `export function init() {}` — completely empty, no icons bundled
  implication: Confirms @nuxt/icon found no local icon packages to bundle at build time

- timestamp: 2026-03-24T00:00:00Z
  checked: nuxt.config.ts icon configuration
  found: No icon configuration block exists — all defaults apply
  implication: No override to force local bundling; relies on auto-detection which requires @iconify-json/heroicons to be installed

## Resolution

root_cause: @iconify-json/heroicons package is not installed. With ssr:false, @nuxt/icon defaults to provider:'iconify' (CDN fetch). Since @iconify-json/heroicons is absent, no icons are bundled at build time and the CDN fetch either fails or is blocked, leaving all i-heroicons-* icons invisible.
fix: Ran `npm install @iconify-json/heroicons` — package added to dependencies at ^1.2.3. @nuxt/icon will now detect the local package, bundle all heroicons SVG data at build time, and serve icons without CDN. All four used icons (archive-box-arrow-down, arrow-down-tray, x-mark, photo) confirmed present in icons.json.
verification: confirmed by user — icons rendering correctly in dev server
files_changed:
  - package.json
  - package-lock.json
