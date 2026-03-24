# Roadmap: Img Conversor

## Overview

Four phases building bottom-up: scaffold the SSG-safe Nuxt 3 foundation, build the browser processing pipeline (the dependency root for everything), wire pipeline into a complete UI with state management and individual downloads, then add ZIP batch download to close out v1. Every phase delivers something verifiable before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Scaffold** - Nuxt 3 SSG project with Vercel deploy pipeline and TypeScript types
- [ ] **Phase 2: Processing Pipeline** - Complete client-side image conversion, resize, and quality control
- [ ] **Phase 3: UI and State** - Full application UI wired to the pipeline with individual download
- [ ] **Phase 4: Batch Download** - ZIP batch download and end-to-end validation

## Phase Details

### Phase 1: Scaffold
**Goal**: A deployable Nuxt 3 SSG project exists with all browser-API isolation patterns established before any Canvas code is written
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03
**Success Criteria** (what must be TRUE):
  1. `nuxt generate` completes without errors and produces a static output directory
  2. Vercel deploy from the repository serves the site at a public URL
  3. TypeScript types (`ImageItem`, `ConvertOptions`, status enums) exist and compile cleanly
  4. jSquash WASM plugin is configured in `nuxt.config.ts` and does not cause build errors
**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Initialize Nuxt 3 project with all deps, types, i18n, and verify SSG build
- [ ] 01-02-PLAN.md — Deploy to Vercel and verify production stack end-to-end

### Phase 2: Processing Pipeline
**Goal**: A stateless `useProcessor` composable converts any image (JPEG/PNG/WebP) with quality and resize options correctly across Chrome, Firefox, and Safari — including all silent-failure edge cases
**Depends on**: Phase 1
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04, CONV-05, RSZN-01, RSZN-02, RSZN-03, RSZN-04, INFR-04, INFR-05
**Success Criteria** (what must be TRUE):
  1. A transparent PNG exported as JPEG renders with a white background (not black) in all browsers
  2. A photo exceeding iOS Safari's 16M-pixel canvas limit is automatically scaled down or rejected with a clear message — not silently corrupted
  3. WebP output is correctly encoded in Safari and iOS (not silently downgraded to PNG)
  4. Activating the proportional resize slider disables the exact-pixel inputs, and vice versa
  5. Processing 10+ large images sequentially does not crash or produce blank outputs
**Plans**: TBD

### Phase 3: UI and State
**Goal**: Users can drop or pick multiple images, configure conversion settings globally, and download each converted image individually — with file sizes and processing status visible throughout
**Depends on**: Phase 2
**Requirements**: INPT-01, INPT-02, INPT-03, INPT-04, OUTP-01, OUTP-02, OUTP-03, OUTP-05
**Success Criteria** (what must be TRUE):
  1. User can drag-and-drop or click to select multiple images and see a thumbnail preview of each original
  2. User sees the file size of each original image and the converted output side by side with savings displayed
  3. Each image card shows a processing status (idle / converting / done / error) that updates in real time
  4. User can download each converted image individually via a per-card download button
  5. A visible trust signal communicates that images never leave the browser
**Plans**: TBD

### Phase 4: Batch Download
**Goal**: Users can download all converted images in a single ZIP file that is only available after all conversions complete
**Depends on**: Phase 3
**Requirements**: OUTP-04
**Success Criteria** (what must be TRUE):
  1. "Download All" button is disabled until all images have finished converting
  2. Clicking "Download All" produces a valid .zip file containing all converted images with correct filenames and extensions
  3. ZIP generation does not freeze the browser tab when processing a large batch
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold | 0/2 | Not started | - |
| 2. Processing Pipeline | 0/? | Not started | - |
| 3. UI and State | 0/? | Not started | - |
| 4. Batch Download | 0/? | Not started | - |
