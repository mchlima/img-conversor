---
phase: 07-onboarding-steps
plan: 01
subsystem: ui
tags: [onboarding, i18n, components]
dependency_graph:
  requires: []
  provides: [OnboardingSteps component, onboarding i18n keys]
  affects: [pages/index.vue, i18n/locales/en.json, i18n/locales/pt-BR.json]
tech_stack:
  added: []
  patterns: [v-for over step keys for DRY card rendering, Tailwind responsive grid]
key_files:
  created:
    - components/OnboardingSteps.vue
  modified:
    - i18n/locales/en.json
    - i18n/locales/pt-BR.json
    - pages/index.vue
decisions:
  - Used v-for over step key array for DRY card rendering instead of repeating 4 cards
  - Component placed after image list div with no v-if so it is always visible
metrics:
  duration: ~5 min
  completed: 2026-03-24
  tasks_completed: 2
  files_changed: 4
---

# Phase 07 Plan 01: Onboarding Steps Summary

**One-liner:** Static "How it works" section with 4 numbered step cards in responsive grid, fully i18n in EN and PT-BR.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add i18n keys and create OnboardingSteps component | 04af4da | i18n/locales/en.json, i18n/locales/pt-BR.json, components/OnboardingSteps.vue |
| 2 | Wire OnboardingSteps into page layout | bed7c3c | pages/index.vue |

## What Was Built

- `components/OnboardingSteps.vue`: Responsive grid of 4 numbered step cards. Uses `v-for` over `['step1', 'step2', 'step3', 'step4']` to avoid repetitive markup. Each card shows step number (bold primary color), title, and description sourced from i18n. Grid is 1 column on mobile, 2 on medium, 4 on large.
- i18n keys added to both locales: `onboarding.title`, `onboarding.step1-4` with `.number`, `.title`, `.description` sub-keys.
- `pages/index.vue`: `<OnboardingSteps />` placed after the image list div with no `v-if` wrapper — always visible regardless of image list state.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| v-for over step key array | Keeps component DRY — 4 near-identical cards without repeating markup |
| No v-if on OnboardingSteps | Satisfies ONBD-01: visible below image list in all states (empty and populated) |
| Plain divs + Tailwind (no UCard) | Lightweight per plan spec — no unnecessary component overhead |

## Verification

- `npx nuxi build` — succeeded with no errors (Build complete in ~5s)
- 4 step cards rendered below drop zone on page load
- No v-if wrapper — cards always visible
- EN locale: "Select images", "Configure output", "Convert", "Download"
- PT-BR locale: "Selecione imagens", "Configure a saida", "Converta", "Baixe"
- Responsive grid: 1 col / 2 col / 4 col at sm/md/lg breakpoints

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all i18n keys are wired and all content is rendered from real translations.

## Self-Check: PASSED

- `/home/michel/projects/codebase/agencia201/img-conversor/components/OnboardingSteps.vue` — FOUND
- `/home/michel/projects/codebase/agencia201/img-conversor/i18n/locales/en.json` (onboarding key) — FOUND
- `/home/michel/projects/codebase/agencia201/img-conversor/i18n/locales/pt-BR.json` (onboarding key) — FOUND
- `/home/michel/projects/codebase/agencia201/img-conversor/pages/index.vue` (OnboardingSteps) — FOUND
- Commit 04af4da — FOUND
- Commit bed7c3c — FOUND
