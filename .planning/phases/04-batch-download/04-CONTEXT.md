# Phase 4: Batch Download - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Botão "Baixar Todas" que gera um arquivo .zip contendo todas as imagens convertidas. Disponível somente após todas as conversões terminarem. Não deve travar o browser em lotes grandes.

</domain>

<decisions>
## Implementation Decisions

### ZIP File Naming
- **D-01:** Nome do arquivo: `img-conversor-{data-hora}.zip` (ex: `img-conversor-2026-03-24-143052.zip`) — evita sobrescrever downloads anteriores

### Button Placement
- **D-02:** Botão "Baixar Todas" posicionado ACIMA da lista de imagens (não na sidebar, não abaixo)
- **D-03:** Botão desabilitado até todas as conversões terminarem

### Claude's Discretion
- Usar fflate (já instalado) para geração do ZIP
- Estratégia de geração do ZIP (streaming vs in-memory)
- Feedback visual durante geração do ZIP (spinner, progress)
- Adição de i18n keys necessárias

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints
- `.planning/REQUIREMENTS.md` — OUTP-04 is this phase's requirement

### Research
- `.planning/research/STACK.md` — fflate recommendation over JSZip, performance notes
- `.planning/research/PITFALLS.md` — JSZip/fflate holds all Blobs in RAM, batch size considerations

### Existing code
- `composables/useImageStore.ts` — Image list state, convertAll, isProcessing computed
- `components/ControlPanel.vue` — Current controls (Convert button lives here)
- `pages/index.vue` — Current page layout (where to add Download All button)
- `types/index.ts` — ImageItem with convertedBlob field

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `fflate` — already installed in Phase 1
- `useImageStore` — provides `images` ref with `convertedBlob` per item, `isProcessing` computed
- `formatBytes` utility — for displaying ZIP file size if needed
- i18n infrastructure — add new keys to existing locale files

### Established Patterns
- Firefox-safe download pattern in `ImageCard.vue` (anchor + click + revoke)
- `isProcessing` computed for button disabled state
- Nuxt UI `UButton` component for consistent styling

### Integration Points
- `pages/index.vue` — add Download All button above the image list
- `composables/useImageStore.ts` — may add `downloadAll` function or `allConverted` computed
- `i18n/locales/*.json` — add download-all related strings

</code_context>

<specifics>
## Specific Ideas

- O botão "Baixar Todas" fica acima da lista, separado do painel de controles
- Nome do ZIP com timestamp para evitar sobrescrever: `img-conversor-YYYY-MM-DD-HHmmss.zip`
- fflate já está no projeto, usar ao invés de JSZip
- Considerar warning se lote muito grande (muitas imagens = muito RAM durante geração do ZIP)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-batch-download*
*Context gathered: 2026-03-24*
