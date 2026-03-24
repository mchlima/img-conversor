# Phase 1: Scaffold - Research

**Researched:** 2026-03-24
**Domain:** Nuxt 3 SSG project initialization, Tailwind CSS, Nuxt UI, @nuxtjs/i18n, jSquash WASM configuration, Vercel SSG deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Tailwind CSS como framework de utilitários CSS
- **D-02:** Nuxt UI como biblioteca de componentes (botões, sliders, dropdowns, cards prontos)
- **D-03:** Layout full-width minimal — sem header fixo, sem sidebar, só a ferramenta com máximo espaço útil
- **D-04:** Nome exibido: "Img Conversor" — texto simples, sem logo
- **D-05:** Tema segue preferência do sistema operacional (light/dark) — usando mecanismo nativo do Nuxt UI
- **D-06:** i18n com suporte a PT-BR e EN
- **D-07:** Idioma padrão detectado pelo navegador do usuário (fallback: EN)
- **D-08:** Usar @nuxtjs/i18n para gerenciar traduções

### Claude's Discretion
- Estrutura de pastas dos composables e componentes
- Configuração específica do vite-plugin-wasm e jSquash
- Definição exata dos tipos TypeScript (ImageItem, ConvertOptions, enums de status)
- Configuração do Vercel deploy (preset, headers CSP para WASM)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFR-01 | Projeto roda com Nuxt 3 + TypeScript | Nuxt 4.4.2 installs via `npx nuxi init`; TypeScript support is built-in, no extra config needed |
| INFR-02 | Build SSG (`nuxt generate`) completa sem erros | Requires `ssr: false` + `nitro.preset: 'static'`; browser-API isolation must be established at scaffold time to prevent build crashes |
| INFR-03 | Deploy funcional na Vercel a partir do repositório | Vercel auto-detects Nitro; zero-config deployment; git-push triggers build; static output served from `.output/public` |
</phase_requirements>

---

## Summary

Phase 1 establishes the deployable Nuxt 3 SSG foundation that all future phases build on. The phase has no image processing logic — its sole purpose is proving the full stack integrates cleanly: Nuxt generates static HTML without errors, Vercel serves it publicly, TypeScript compiles the base domain types, and the jSquash WASM plugin loads without crashing the build.

The most important work in this phase is establishing browser-API isolation patterns. Nuxt 3 SSG pre-renders pages in Node.js at build time; any code that references `window`, `document`, or canvas APIs at module scope or in `setup()` will crash `nuxt generate`. This pitfall must be wired in from the first commit — it is far more expensive to fix retroactively across 50 components than to establish the pattern once in an empty scaffold.

The WASM pipeline (jSquash + vite-plugin-wasm) must be verified end-to-end in this phase even though no actual image encoding occurs yet. If WASM configuration issues are discovered in Phase 2, they block all conversion work. A minimal "WASM loads" smoke test in Phase 1 eliminates that Phase 2 risk.

**Primary recommendation:** Initialize Nuxt 3 with `nuxi init`, add Nuxt UI (which bundles Tailwind CSS v4 and color-mode), @nuxtjs/i18n, and vite-plugin-wasm in a single pass, then write one `nuxt generate` + Vercel deploy verification before writing any component logic.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nuxt | 4.4.2 | App framework, SSG via `nuxt generate` | Non-negotiable per project constraints. Bundles Vue 3.5.x + TypeScript 5.x + Vite 5 |
| @nuxt/ui | 4.6.0 | Component library (buttons, sliders, dropdowns, cards) | Locked decision D-02. Auto-registers Tailwind CSS v4 and @nuxtjs/color-mode — no separate installs needed |
| @nuxtjs/i18n | 10.2.4 | PT-BR/EN locale management + browser language detection | Locked decision D-08. Configures Vue I18n v11 internally |
| vite-plugin-wasm | 3.6.0 | Enables WASM imports in Vite/Nuxt build pipeline | Required for jSquash codecs in Phase 2. Must be validated in scaffold phase to unblock downstream phases |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @jsquash/webp | 1.5.0 | WebP WASM codec — install now, use in Phase 2 | Install in scaffold so `vite-plugin-wasm` integration can be validated end-to-end before Phase 2 begins |
| @nuxt/eslint | latest | ESLint with Nuxt/Vue/TS rules bundled | Development quality — add once during scaffold, costs nothing to defer but costs more to retrofit |

### Nuxt UI includes these automatically — do NOT install separately
- tailwindcss (v4)
- @nuxtjs/color-mode
- reka-ui (headless primitives)
- tailwind-variants

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @nuxt/ui (bundles Tailwind v4) | @nuxtjs/tailwindcss separately | Nuxt UI already owns the Tailwind integration; adding the separate module creates conflicts |
| @nuxtjs/i18n | Manual vue-i18n setup | @nuxtjs/i18n adds Nuxt-aware composables, auto-import, and SSG route handling that manual setup lacks |

**Installation:**

```bash
# Step 1: Initialize Nuxt project
npx nuxi@latest init img-conversor
cd img-conversor

# Step 2: Add Nuxt UI (includes Tailwind CSS v4 + color-mode)
npx nuxi@latest module add ui

# Step 3: Add i18n
npx nuxi@latest module add @nuxtjs/i18n

# Step 4: WASM plugin + jSquash codec (install now, wire in scaffold, use in Phase 2)
npm install -D vite-plugin-wasm
npm install @jsquash/webp

# Step 5: ESLint
npx nuxi@latest module add eslint
```

**Version verification (confirmed 2026-03-24 via npm registry):**
- nuxt: 4.4.2
- @nuxt/ui: 4.6.0
- @nuxtjs/i18n: 10.2.4
- vite-plugin-wasm: 3.6.0
- @jsquash/webp: 1.5.0

---

## Architecture Patterns

### Recommended Project Structure

```
img-conversor/
├── app.vue                    # Root layout — NuxtPage only
├── nuxt.config.ts             # Central config: modules, i18n, vite WASM
├── tailwind.css               # Tailwind v4 entry (imported in nuxt.config.ts css[])
├── pages/
│   └── index.vue              # Single page where the tool lives
├── components/
│   └── (empty in Phase 1 — placeholder only)
├── composables/
│   └── (empty in Phase 1 — placeholder only)
├── types/
│   └── index.ts               # ImageItem, ConvertOptions, status enums
├── i18n/
│   └── locales/
│       ├── en.json            # English strings
│       └── pt-BR.json         # Portuguese (Brazil) strings
└── public/
    └── favicon.ico
```

### Pattern 1: nuxt.config.ts — Complete Scaffold Configuration

**What:** Central configuration wiring all Phase 1 dependencies together.
**When to use:** This is the canonical config for the entire project.

```typescript
// nuxt.config.ts
import wasm from 'vite-plugin-wasm'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  // Pure client-side tool — no server rendering needed at route level.
  // nuxt generate still emits static HTML shells.
  ssr: false,

  nitro: {
    preset: 'static', // produces .output/public for Vercel static serving
  },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
  ],

  // Nuxt UI handles color-mode automatically — no separate config needed.
  // System preference (light/dark) is the default behavior.

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'pt-BR', name: 'Português (Brasil)', file: 'pt-BR.json' },
    ],
    defaultLocale: 'en',
    langDir: 'i18n/locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',   // recommended for SSG + SEO
      fallbackLocale: 'en',
    },
  },

  vite: {
    plugins: [wasm()],
    optimizeDeps: {
      // Prevent Vite from pre-bundling WASM packages — they must be loaded as-is
      exclude: ['@jsquash/webp'],
    },
  },

  build: {
    transpile: ['@jsquash/webp'],
  },

  css: ['~/tailwind.css'],

  devtools: { enabled: true },
})
```

### Pattern 2: Browser-API Isolation

**What:** All browser-only code must be guarded from Node.js at build time.
**When to use:** Any composable, component, or utility that touches `window`, `document`, `canvas`, `FileReader`, `URL.createObjectURL`, or any jSquash import.

```typescript
// Composables that use browser APIs — guard with import.meta.client
export function useImageProcessor() {
  // This function body only runs in the browser
  // Safe to reference window, canvas, etc. inside here
  const init = async () => {
    if (!import.meta.client) return
    // browser-only setup
  }
  onMounted(init)
}
```

```vue
<!-- For components that cannot be server-rendered at all -->
<!-- pages/index.vue -->
<template>
  <ClientOnly>
    <ConverterTool />
  </ClientOnly>
</template>
```

```typescript
// Lazy-import WASM modules — never at module top-level
const encode = async (imageData: ImageData): Promise<Uint8Array> => {
  // Dynamic import inside function body — safe for SSG
  const { encode } = await import('@jsquash/webp')
  return encode(imageData)
}
```

### Pattern 3: TypeScript Domain Types

**What:** Centralized type definitions in `types/index.ts`. These types are consumed by all future phases.
**When to use:** Defined once in scaffold, imported everywhere.

```typescript
// types/index.ts

export type OutputFormat = 'image/webp' | 'image/jpeg' | 'image/png'

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export interface ImageItem {
  id: string                  // crypto.randomUUID() — client-side only
  file: File
  name: string
  originalSize: number        // bytes — from file.size
  convertedSize: number | null
  convertedBlob: Blob | null
  status: ProcessingStatus
  error: string | null
  previewUrl: string | null   // object URL for display — must be revoked on cleanup
}

export interface ConvertOptions {
  format: OutputFormat
  quality: number             // 1–100 (UI slider) — convert to 0.01–1.0 before passing to codec
  resizeMode: 'none' | 'proportional' | 'exact'
  resizePercent: number       // 1–100 (proportional slider)
  resizeWidth: number | null  // px (exact mode)
  resizeHeight: number | null // px (exact mode)
}
```

### Pattern 4: Nuxt UI Color Mode (System Preference)

**What:** Nuxt UI automatically registers @nuxtjs/color-mode. System preference is the default `colorMode.preference`.
**When to use:** No extra configuration needed for system preference detection (D-05).

The `@nuxt/ui` module handles this automatically. The only thing to confirm is that no explicit `colorMode` config overrides the default in `nuxt.config.ts`. The default preference is `'system'` which reads `prefers-color-scheme` from the OS.

### Pattern 5: Vercel Deployment

**What:** Vercel auto-detects Nitro and serves `.output/public` as a static site. Zero manual configuration required.
**When to use:** Push to git repository connected to Vercel.

Vercel detects `nuxt generate` builds automatically. The `nitro.preset: 'static'` in `nuxt.config.ts` ensures the output is in the format Vercel expects. No `vercel.json` is needed for basic SSG deployment.

**WASM CSP consideration (Claude's Discretion):** If Vercel's default CSP headers block WASM execution in production, add a `vercel.json` with:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; ..."
        }
      ]
    }
  ]
}
```

The `'wasm-unsafe-eval'` directive is required for WASM execution under strict CSP. This is a Phase 1 concern only if Vercel sets restrictive default headers (verify at first deploy).

### Anti-Patterns to Avoid

- **Module-scope browser API access:** Never `const canvas = document.createElement('canvas')` at the top of a composable — crashes `nuxt generate`
- **Dynamic i18n locale file paths:** Use static `file: 'en.json'` in locale config — dynamic paths confuse Nuxt's static analysis
- **Installing @nuxtjs/tailwindcss separately:** Nuxt UI owns Tailwind v4 — a separate tailwindcss module causes conflicts and duplicate processing
- **Importing @jsquash at module top-level:** WASM init is async and must be called inside a lifecycle hook or async function, never at import time

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark/light mode | Custom CSS class toggling + localStorage | `@nuxt/ui` (bundles `@nuxtjs/color-mode`) | Handles SSR flicker, system preference, cookie persistence, and Vue reactivity — 50+ edge cases |
| Browser language detection | `navigator.language` parsing + cookie | `@nuxtjs/i18n` `detectBrowserLanguage` | Handles accept-language header server-side, locale fallback chains, cookie persistence across sessions |
| i18n routing (prefix strategy) | Manual route middleware | `@nuxtjs/i18n` strategy config | Auto-generates localized routes, handles redirect logic, SEO hreflang — complex to replicate correctly |
| WASM module loading | Custom fetch + WebAssembly.instantiate | `vite-plugin-wasm` | Handles ESM integration, Vite pre-bundling exclusion, and cross-browser WASM instantiation patterns |
| Component primitives (buttons, sliders) | Custom HTML + CSS from scratch | `@nuxt/ui` | Accessibility (ARIA), keyboard nav, focus management — not worth building for a v1 tool |

**Key insight:** The scaffold phase primarily installs infrastructure, not logic. The value is in wiring the right tools together correctly — not in custom solutions.

---

## Common Pitfalls

### Pitfall 1: `nuxt generate` Crashes on Browser APIs

**What goes wrong:** `window is not defined` or `document is not defined` error during build, even though `nuxt dev` works perfectly. This is the #1 Nuxt SSG pitfall.

**Why it happens:** Nuxt pre-renders pages in Node.js. Any code that references browser globals at module scope or in synchronous `setup()` executes in Node.js — where those APIs don't exist. `nuxt dev` masks this because it runs in the browser.

**How to avoid:**
- Wrap all browser-API logic in `onMounted()` or `if (import.meta.client)`
- Use `<ClientOnly>` wrapper for entire components that use canvas, FileReader, etc.
- Run `nuxt generate` in CI from the first commit — don't rely on `nuxt dev` alone

**Warning signs:** Dev works, build fails. Error message contains `window is not defined`, `document is not defined`, or `ReferenceError: [BrowserAPI] is not defined`.

### Pitfall 2: jSquash WASM Breaks Vite Pre-bundling

**What goes wrong:** Build error like `Error: Cannot use import statement inside a module that is not an ES module` or silent WASM loading failure. Happens when jSquash packages are Vite-pre-bundled (they must not be).

**Why it happens:** Vite's dependency pre-bundler converts ESM to CJS for faster dev server startup. WASM packages are ESM-only and use top-level `await` — both break under pre-bundling.

**How to avoid:**
- Add ALL jSquash packages to `vite.optimizeDeps.exclude` in `nuxt.config.ts`
- Also add to `build.transpile` if Nuxt tries to server-side bundle them
- Verify: `nuxt generate` should complete without WASM-related errors

**Warning signs:** `Failed to load module script`, `WebAssembly.instantiate` errors in console, or build errors mentioning `@jsquash/webp`.

### Pitfall 3: @nuxt/ui v4 Requires Tailwind CSS v4 CSS Import

**What goes wrong:** Tailwind classes not applied — styles missing in output. Happens because Nuxt UI v4 uses CSS-first Tailwind v4 configuration (no `tailwind.config.js`), and requires a CSS entry file.

**Why it happens:** Tailwind v4 changed from JS config (`tailwind.config.js`) to CSS config (`@import "tailwindcss"`). Nuxt UI v4 expects this new import pattern.

**How to avoid:**
- Create `tailwind.css` at project root with `@import "tailwindcss"; @import "@nuxt/ui";`
- Add `css: ['~/tailwind.css']` to `nuxt.config.ts`
- Do NOT create `tailwind.config.js` — not needed in v4

**Warning signs:** All components render unstyled. No error thrown — classes silently produce nothing.

### Pitfall 4: @nuxtjs/i18n locale files not found at generate time

**What goes wrong:** Build error or missing translations in the static output. Happens when locale file paths are wrong or the `langDir` points to a non-existent directory.

**Why it happens:** `nuxt generate` must be able to statically analyze and bundle locale files. The `langDir` path is relative to `rootDir` (project root), not `srcDir`.

**How to avoid:**
- Create the `i18n/locales/` directory at project root (not inside `src/`)
- Use `file: 'en.json'` (just filename) in locale config — not full paths
- Verify both locale files exist before running `nuxt generate`

**Warning signs:** `nuxt generate` succeeds but `$t('key')` renders the key string instead of the translation, or a file-not-found error during build.

### Pitfall 5: Nuxt UI v4 vs v3 Module Name Confusion

**What goes wrong:** Installing `nuxt-ui` (old package name) instead of `@nuxt/ui` (current), or referencing v2/v3 documentation patterns.

**Why it happens:** The package was renamed from `nuxt-ui` to `@nuxt/ui` when it became an official Nuxt module. Old blog posts and StackOverflow answers reference the legacy package name.

**How to avoid:**
- Use `npx nuxi@latest module add ui` — installs `@nuxt/ui` 4.x
- Module name in `nuxt.config.ts` is `'@nuxt/ui'`
- Documentation: https://ui.nuxt.com (not nuxtui.pro)

---

## Code Examples

### Complete nuxt.config.ts for Phase 1

```typescript
// nuxt.config.ts
// Source: STACK.md + Nuxt UI docs (https://ui.nuxt.com) + @nuxtjs/i18n docs
import wasm from 'vite-plugin-wasm'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  nitro: { preset: 'static' },

  modules: ['@nuxt/ui', '@nuxtjs/i18n', '@nuxt/eslint'],

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'pt-BR', name: 'Português (Brasil)', file: 'pt-BR.json' },
    ],
    defaultLocale: 'en',
    langDir: 'i18n/locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  vite: {
    plugins: [wasm()],
    optimizeDeps: {
      exclude: ['@jsquash/webp'],
    },
  },

  build: {
    transpile: ['@jsquash/webp'],
  },

  css: ['~/tailwind.css'],
  devtools: { enabled: true },
})
```

### tailwind.css Entry File (Tailwind v4 Pattern)

```css
/* tailwind.css */
/* Source: Nuxt UI docs — https://ui.nuxt.com/docs/getting-started */
@import "tailwindcss";
@import "@nuxt/ui";
```

### Minimal app.vue

```vue
<!-- app.vue -->
<template>
  <NuxtPage />
</template>
```

### Minimal pages/index.vue with ClientOnly Guard

```vue
<!-- pages/index.vue -->
<template>
  <div class="min-h-screen">
    <header class="py-4 px-6">
      <h1 class="text-xl font-semibold">{{ $t('app.name') }}</h1>
    </header>
    <main class="px-6">
      <ClientOnly>
        <!-- Canvas/File API components go here in Phase 3+ -->
        <p>{{ $t('app.tagline') }}</p>
      </ClientOnly>
    </main>
  </div>
</template>
```

### TypeScript Domain Types (types/index.ts)

```typescript
// types/index.ts
// All types defined once here — imported in all future phases

export type OutputFormat = 'image/webp' | 'image/jpeg' | 'image/png'

export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error'

export interface ImageItem {
  id: string
  file: File
  name: string
  originalSize: number
  convertedSize: number | null
  convertedBlob: Blob | null
  status: ProcessingStatus
  error: string | null
  previewUrl: string | null
}

export interface ConvertOptions {
  format: OutputFormat
  quality: number             // 1–100 slider value (divide by 100 before passing to codec)
  resizeMode: 'none' | 'proportional' | 'exact'
  resizePercent: number       // 1–100
  resizeWidth: number | null
  resizeHeight: number | null
}
```

### WASM Smoke Test Pattern (validates vite-plugin-wasm works)

```typescript
// In pages/index.vue or a dedicated smoke-test composable
// Run this onMounted to verify WASM loads — if it throws, Phase 2 is blocked

onMounted(async () => {
  try {
    // Dynamic import — never at module top-level
    const webp = await import('@jsquash/webp')
    console.info('[WASM] @jsquash/webp loaded successfully', webp)
  } catch (err) {
    console.error('[WASM] Failed to load @jsquash/webp:', err)
  }
})
```

### Locale Files (minimal for Phase 1)

```json
// i18n/locales/en.json
{
  "app": {
    "name": "Img Conversor",
    "tagline": "Convert, resize, and optimize images — in your browser, instantly."
  }
}
```

```json
// i18n/locales/pt-BR.json
{
  "app": {
    "name": "Img Conversor",
    "tagline": "Converta, redimensione e otimize imagens — no seu navegador, instantaneamente."
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (JS config) | CSS-first `@import "tailwindcss"` | Tailwind v4 (2025) | No tailwind.config.js needed; configuration lives in CSS |
| `nuxt-ui` (npm package name) | `@nuxt/ui` | Nuxt UI became official module | Import name and docs URL changed |
| `@nuxtjs/tailwindcss` module | `@nuxt/ui` owns Tailwind | Nuxt UI v4 | Don't install @nuxtjs/tailwindcss alongside @nuxt/ui v4 |
| `process.client` guard | `import.meta.client` | Nuxt 3.x | `import.meta.client` is the current Nuxt 3 idiom; `process.client` still works but is deprecated style |
| `nuxt generate --target static` | `nuxt generate` (no flag) + `nitro.preset: 'static'` | Nuxt 3 | Target flag moved to nitro preset config |

**Deprecated/outdated:**
- `process.client`: Still works, but `import.meta.client` is the preferred Nuxt 3.x guard
- `tailwind.config.js`: Not needed for Tailwind v4 / Nuxt UI v4
- `nuxt-ui` npm package: Replaced by `@nuxt/ui`

---

## Open Questions

1. **WASM CSP headers on Vercel**
   - What we know: Vercel auto-detects Nitro, zero-config for basic SSG. WASM requires `'wasm-unsafe-eval'` in CSP if restrictive headers are set.
   - What's unclear: Whether Vercel applies restrictive default CSP headers that would block WASM execution for static sites (vs. Edge/SSR functions).
   - Recommendation: Deploy the scaffold to Vercel and test WASM loading in the browser console. If WASM fails in production but works in dev, add `vercel.json` with the CSP header shown in Pattern 5 above.

2. **@jsquash/webp 1.5.0 pre-release stability**
   - What we know: Version is pinned at 1.5.0. The STATE.md flags this as a Phase 2 concern: "Verify @jsquash/webp 1.5.0 API compatibility before implementation — pre-release, pin version."
   - What's unclear: Whether the API surface will change between Phase 1 (install) and Phase 2 (use).
   - Recommendation: Pin exact version in package.json (`"@jsquash/webp": "1.5.0"` not `"^1.5.0"`). Verify encode function signature in Phase 2 before wiring.

3. **@nuxtjs/i18n v10 SSG route strategy**
   - What we know: v10 introduced stricter behavior for `redirectOn` and prefix-based routing. For a single-page tool, the routing impact may be minimal.
   - What's unclear: Whether a single-page tool needs `strategy: 'no_prefix'` to avoid i18n adding `/en/` and `/pt-BR/` prefixes to URLs, which could affect Vercel routing.
   - Recommendation: Use `strategy: 'no_prefix'` in the i18n config to keep URLs clean (no locale prefix). This is appropriate for a SPA-style tool where SEO multi-locale routing is not a goal.

---

## Sources

### Primary (HIGH confidence)
- npm registry (2026-03-24) — verified versions: nuxt@4.4.2, @nuxt/ui@4.6.0, @nuxtjs/i18n@10.2.4, vite-plugin-wasm@3.6.0, @jsquash/webp@1.5.0
- [STACK.md](../../research/STACK.md) — jSquash WASM configuration, vite-plugin-wasm setup, optimizeDeps pattern — HIGH (project research)
- [PITFALLS.md](../../research/PITFALLS.md) — Nuxt SSG + browser API pitfalls, toBlob vs toDataURL — HIGH (project research)
- [Nuxt UI docs](https://ui.nuxt.com/docs/getting-started) — installation, Tailwind v4 CSS import pattern, color-mode integration — HIGH

### Secondary (MEDIUM confidence)
- [Nuxt i18n browser detection docs](https://i18n.nuxtjs.org/docs/guide/browser-language-detection) — detectBrowserLanguage config, useCookie, redirectOn — MEDIUM (verified against npm version)
- [Nuxt deploy: Vercel](https://nuxt.com/deploy/vercel) — zero-config Nitro auto-detection — MEDIUM (Vercel-specific CSP behavior unverified)
- [jSquash GitHub](https://github.com/jamsinclair/jSquash) — WASM codec packages, Nuxt/Vite config requirements — MEDIUM (pre-release package)

### Tertiary (LOW confidence)
- [Nuxt WASM discussion #17124](https://github.com/nuxt/nuxt/discussions/17124) — WASM CSP header requirement (`wasm-unsafe-eval`) — LOW (community discussion, not official docs)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from npm registry on research date
- Architecture: HIGH — patterns derived from official Nuxt UI, Nuxt i18n, and jSquash docs
- Pitfalls: HIGH — cross-referenced with PITFALLS.md (project research) and MDN
- WASM CSP on Vercel: LOW — requires empirical validation at first deploy

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (30 days — stable ecosystem; @jsquash/webp is pre-release so recheck if version changes)
