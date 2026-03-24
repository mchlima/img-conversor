# Roadmap: Img Conversor

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-24)
- ✅ **v1.1 UI Refactor** — Phase 5 (shipped 2026-03-24)
- ✅ **v1.2 Accumulate & Clear** — Phase 6 (shipped 2026-03-24)
- ✅ **v1.3 Onboarding Steps** — Phase 7 (shipped 2026-03-24)
- 🔄 **v1.4 Per-Image Exact Resize** — Phase 8 (active)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-24</summary>

- [x] Phase 1: Scaffold (2/2 plans) — completed 2026-03-24
- [x] Phase 2: Processing Pipeline (2/2 plans) — completed 2026-03-24
- [x] Phase 3: UI and State (2/2 plans) — completed 2026-03-24
- [x] Phase 4: Batch Download (1/1 plan) — completed 2026-03-24

</details>

<details>
<summary>✅ v1.1 UI Refactor (Phase 5) — SHIPPED 2026-03-24</summary>

- [x] Phase 5: ControlPanel Layout Refactor (1/1 plan) — completed 2026-03-24

</details>

<details>
<summary>✅ v1.2 Accumulate & Clear (Phase 6) — SHIPPED 2026-03-24</summary>

- [x] Phase 6: Upload Accumulation & Clear (1/1 plan) — completed 2026-03-24

</details>

<details>
<summary>✅ v1.3 Onboarding Steps (Phase 7) — SHIPPED 2026-03-24</summary>

- [x] Phase 7: Onboarding Steps (1/1 plan) — completed 2026-03-24

</details>

### v1.4 Per-Image Exact Resize

- [ ] **Phase 8: Per-Image Exact Resize** - Global px baseline in ControlPanel with per-card override, aspect-ratio lock, and max-resolution guard

## Phase Details

### Phase 8: Per-Image Exact Resize
**Goal**: Users can set exact pixel dimensions globally and override them per image, with aspect ratio preserved and dimensions capped at original resolution
**Depends on**: Phase 7
**Requirements**: RSZN-10, RSZN-11, RSZN-12, RSZN-13, RSZN-14, RSZN-15
**Success Criteria** (what must be TRUE):
  1. When "Exato (px)" mode is active, the ControlPanel shows global width/height fields that apply to all images by default
  2. Each ImageCard shows its own width/height fields pre-filled with that image's original resolution when "Exato (px)" mode is active
  3. Editing a card's width/height field updates only that card and marks it as manually overridden, leaving other cards unaffected
  4. Changing the global value in ControlPanel updates all cards that have not been manually overridden, leaving overridden cards unchanged
  5. Changing width in a card's fields automatically adjusts height to maintain the original aspect ratio (and vice versa), and neither field accepts a value larger than the image's original dimension
**Plans:** 2 plans

Plans:
- [ ] 08-01-PLAN.md — Data layer: extend ImageItem type, store per-image resize logic, processor per-image reading
- [ ] 08-02-PLAN.md — UI layer: ImageCard resize fields with aspect-ratio lock, ControlPanel global propagation

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Scaffold | v1.0 | 2/2 | Complete | 2026-03-24 |
| 2. Processing Pipeline | v1.0 | 2/2 | Complete | 2026-03-24 |
| 3. UI and State | v1.0 | 2/2 | Complete | 2026-03-24 |
| 4. Batch Download | v1.0 | 1/1 | Complete | 2026-03-24 |
| 5. ControlPanel Layout Refactor | v1.1 | 1/1 | Complete | 2026-03-24 |
| 6. Upload Accumulation & Clear | v1.2 | 1/1 | Complete | 2026-03-24 |
| 7. Onboarding Steps | v1.3 | 1/1 | Complete | 2026-03-24 |
| 8. Per-Image Exact Resize | v1.4 | 0/2 | Not started | - |
