---
phase: 05-controlpanel-layout-refactor
plan: 01
subsystem: ui-layout
tags: [layout, controlpanel, refactor, conditional-visibility]
requires: []
provides: [horizontal-control-bar, conditional-controlpanel, absorbed-download-all]
affects: [pages/index.vue, components/ControlPanel.vue]
tech-stack:
  added: []
  patterns: [flex-wrap responsive layout, conditional v-if visibility, component absorption]
key-files:
  created: []
  modified:
    - components/ControlPanel.vue
    - pages/index.vue
  deleted:
    - components/DownloadAllButton.vue
decisions:
  - DownloadAllButton logic absorbed into ControlPanel rather than kept as separate component
  - hasDoneImages uses .some() (at least one done) rather than allConverted which requires ALL done
  - Convert button uses ml-auto instead of block width to push right in flex row
metrics:
  duration: 111s
  completed: "2026-03-24T17:50:17Z"
  tasks_completed: 3
  files_modified: 3
---

# Phase 05 Plan 01: ControlPanel Layout Refactor Summary

**One-liner:** ControlPanel refactored from vertical sidebar to horizontal flex-wrap bar with absorbed Download All button, conditionally visible when images are loaded.

## What Was Built

Converted the ControlPanel from a fixed vertical sidebar into a state-aware horizontal control bar that:
- Appears only when images are loaded (LAYT-02)
- Renders above the image list in a single-column layout (LAYT-01)
- Contains the Download All button internally (LAYT-03)
- Shows Download All only when at least one image is converted (LAYT-04)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Refactor ControlPanel to horizontal bar | 7ee25fd | components/ControlPanel.vue |
| 2 | Update page layout and remove DownloadAllButton | 898662d | pages/index.vue, components/DownloadAllButton.vue (deleted) |
| 3 | Checkpoint: auto-approved | — | none |

## Key Changes

**components/ControlPanel.vue:**
- Full template rewrite: `space-y-5` vertical layout replaced with `flex flex-wrap items-end gap-4`
- Each control group uses `min-w-[...]` for responsive wrapping behavior
- Added `import { downloadAll } from '~/utils/downloadAll'`
- Added `hasDoneImages` computed: `images.value.some(i => i.status === 'done')`
- Added `isGenerating` ref and `handleDownload` function (absorbed from DownloadAllButton)
- Download All button rendered with `v-if="hasDoneImages"` inside the flex row
- Convert button uses `ml-auto` instead of `block` attribute

**pages/index.vue:**
- Removed `lg:grid lg:grid-cols-[320px_1fr] lg:gap-6` sidebar grid
- Removed `<aside>` block wrapping ControlPanel
- Single-column `max-w-6xl mx-auto space-y-4` layout
- ControlPanel added with `v-if="images.length > 0"` above DropZone
- Removed `<DownloadAllButton />` and its conditional wrapper div

**components/DownloadAllButton.vue:** Deleted. Logic absorbed into ControlPanel.

## Deviations from Plan

None - plan executed exactly as written.

Pre-existing type errors (3 errors in ControlPanel.vue related to USelect/USlider event handler types) were present before this plan and not introduced by these changes. Confirmed by reverting to baseline and checking.

## Verification

- `npx nuxi typecheck` — same 3 pre-existing errors, no new errors introduced
- All acceptance criteria met:
  - `flex flex-wrap` in ControlPanel template
  - `downloadAll` import in ControlPanel
  - `hasDoneImages` computed in ControlPanel
  - `isGenerating` ref in ControlPanel
  - `handleDownload` function in ControlPanel
  - `v-if="hasDoneImages"` on Download All button
  - `$t('batch.download_all')` i18n key used
  - `i-heroicons-archive-box-arrow-down` icon used
  - No `space-y-5` in ControlPanel
  - No `block` attribute on Convert button
  - No `grid-cols-[320px_1fr]` in index.vue
  - No `<aside>` in index.vue
  - No `DownloadAllButton` in index.vue
  - `ControlPanel` appears before `DropZone` in index.vue
  - `components/DownloadAllButton.vue` deleted

## Self-Check: PASSED
