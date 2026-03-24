# Roadmap: Img Conversor

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-24)
- ✅ **v1.1 UI Refactor** — Phase 5 (shipped 2026-03-24)
- **v1.2 Accumulate & Clear** — Phase 6 (active)

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

### v1.2 Accumulate & Clear

- [ ] **Phase 6: Upload Accumulation & Clear** — Upload acumula imagens; botão Limpar reseta a lista

## Phase Details

### Phase 6: Upload Accumulation & Clear
**Goal**: Users can accumulate images across multiple uploads and clear the list in one action
**Depends on**: Phase 5 (ControlPanel layout exists)
**Requirements**: UPLD-01, CTRL-01, CTRL-02
**Success Criteria** (what must be TRUE):
  1. Selecting new images via drag-and-drop or click adds them to the existing list without removing previously selected images
  2. A "Limpar" button is visible in the ControlPanel whenever the image list is non-empty
  3. Clicking "Limpar" removes all images from the list, returning to the empty/initial state
  4. The "Limpar" button is not visible when the image list is empty
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Scaffold | v1.0 | 2/2 | Complete | 2026-03-24 |
| 2. Processing Pipeline | v1.0 | 2/2 | Complete | 2026-03-24 |
| 3. UI and State | v1.0 | 2/2 | Complete | 2026-03-24 |
| 4. Batch Download | v1.0 | 1/1 | Complete | 2026-03-24 |
| 5. ControlPanel Layout Refactor | v1.1 | 1/1 | Complete | 2026-03-24 |
| 6. Upload Accumulation & Clear | v1.2 | 0/? | Not started | - |
