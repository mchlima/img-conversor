# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-24
**Phases:** 4 | **Plans:** 7 | **Commits:** 52

### What Was Built
- Nuxt 3 SSG scaffold deployed to Vercel with WASM pipeline (jSquash + vite-plugin-wasm)
- Cross-browser image processing: JPEG/PNG/WebP conversion with quality control and resize (proportional + exact)
- Complete UI: drag-drop upload, vertical image cards with preview/sizes/status, control panel with all settings
- Batch ZIP download via fflate with timestamped filename and filename deduplication
- i18n support (PT-BR + EN) with browser language detection
- Edge case handling: PNG transparency fill, iOS Safari 16M pixel limit, Safari WebP via WASM

### What Worked
- Bottom-up phase ordering (scaffold → pipeline → UI → batch) prevented dependency issues
- jSquash WASM research caught the Safari WebP silent-fallback before it became a production bug
- Research phase for each phase caught real issues (fflate not installed, langDir path, CSP needs)
- Plan verification loop caught CSP unsafe-inline issue before deployment
- Coarse granularity (4 phases) kept context manageable

### What Was Inefficient
- CSP `unsafe-inline` had to be added back after checker removed it — research correctly identified the need but revision loop over-corrected
- Some plan 02 summaries had "One-liner:" as their one-liner (extraction format issue)
- fflate was listed as "already installed" in CLAUDE.md but wasn't — research caught it

### Patterns Established
- `onMounted` + dynamic import for WASM modules
- `<ClientOnly>` for browser-API-dependent content
- `useState` for reactive composable state
- Firefox-safe download pattern (anchor + click + revoke)
- `try/finally` with `canvas.width = 0` for memory cleanup

### Key Lessons
1. Always verify "already installed" claims — the researcher found fflate missing despite documentation saying otherwise
2. CSP for Nuxt SSG requires `unsafe-inline` in `script-src` — inline hydration scripts can't use nonces in static output
3. Nuxt UI v4 renamed components (URange → USlider) — always check current API docs
4. Safari WebP encoding must always go through jSquash WASM — Canvas silently falls back to PNG

### Cost Observations
- Model mix: Opus for planning, Sonnet for research/execution/verification
- Entire v1.0 completed in a single session (~4 hours)
- 7 plans across 4 phases — coarse granularity was efficient

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 4 |
| Plans | 7 |
| Commits | 52 |
| LOC | ~19,000 |
| Duration | 1 day |
| Rework cycles | 1 (CSP fix) |
