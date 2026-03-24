# Roadmap: Img Conversor

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-24)
- 🚧 **v1.1 UI Refactor** — Phase 5 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-24</summary>

- [x] Phase 1: Scaffold (2/2 plans) — completed 2026-03-24
- [x] Phase 2: Processing Pipeline (2/2 plans) — completed 2026-03-24
- [x] Phase 3: UI and State (2/2 plans) — completed 2026-03-24
- [x] Phase 4: Batch Download (1/1 plan) — completed 2026-03-24

</details>

### 🚧 v1.1 UI Refactor (In Progress)

**Milestone Goal:** Reorganize the ControlPanel as a state-aware horizontal bar above the image list, with the batch download action consolidated inside it and visibility driven by image state.

- [ ] **Phase 5: ControlPanel Layout Refactor** - Horizontal bar replaces sidebar, "Download All" moves inside panel with conditional visibility

## Phase Details

### Phase 5: ControlPanel Layout Refactor
**Goal**: The ControlPanel is a state-aware horizontal bar above the image list, with "Download All" consolidated inside it
**Depends on**: Phase 4
**Requirements**: LAYT-01, LAYT-02, LAYT-03, LAYT-04
**Success Criteria** (what must be TRUE):
  1. When no images are selected, the ControlPanel is not visible anywhere on the page
  2. When images are selected, a horizontal control bar appears above the image list (not as a sidebar beside it)
  3. The "Download All" button is rendered inside the ControlPanel bar, not as a separate standalone component elsewhere on the page
  4. The "Download All" button is hidden when no images have finished converting, and visible once at least one image reaches "done" status
**Plans:** 1 plan

Plans:
- [ ] 05-01-PLAN.md — Refactor ControlPanel to horizontal bar, absorb Download All, update page layout

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Scaffold | v1.0 | 2/2 | Complete | 2026-03-24 |
| 2. Processing Pipeline | v1.0 | 2/2 | Complete | 2026-03-24 |
| 3. UI and State | v1.0 | 2/2 | Complete | 2026-03-24 |
| 4. Batch Download | v1.0 | 1/1 | Complete | 2026-03-24 |
| 5. ControlPanel Layout Refactor | v1.1 | 0/1 | Not started | - |
