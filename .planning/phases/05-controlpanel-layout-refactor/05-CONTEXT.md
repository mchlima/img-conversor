# Phase 5: ControlPanel Layout Refactor - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Refatorar o ControlPanel de sidebar lateral para barra horizontal acima da lista de imagens, com visibilidade condicional e botão "Baixar Todas" consolidado dentro. Sem alterações no pipeline de processamento ou funcionalidades.

</domain>

<decisions>
## Implementation Decisions

### Layout da Barra
- **D-01:** Controles em flexbox horizontal com cada item como bloco vertical (label em cima, field embaixo) para economizar espaço horizontal
- **D-02:** Flex wrap para quebra de linha no mobile quando não cabe em uma linha
- **D-03:** Botões "Converter" e "Baixar Todas" na mesma linha dos controles (parte do flex row)

### Visibilidade
- **D-04:** ControlPanel inteiro visível apenas quando `images.length > 0` (herdado LAYT-02)
- **D-05:** Botão "Baixar Todas" visível dentro do ControlPanel apenas quando há pelo menos uma imagem com status "done" (herdado LAYT-04)

### Remoção
- **D-06:** Remover o componente `DownloadAllButton.vue` separado — funcionalidade absorvida pelo ControlPanel
- **D-07:** Remover layout de sidebar (`lg:grid-cols-[320px_1fr]`) do `pages/index.vue`

### Claude's Discretion
- Espaçamento e gaps entre controles na barra
- Breakpoints exatos para wrap
- Organização dos controles de resize (proporcional vs exato) no espaço horizontal
- Transição/animação ao mostrar/esconder o ControlPanel

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing code (MUST READ before modifying)
- `components/ControlPanel.vue` — Current sidebar-layout control panel to refactor
- `components/DownloadAllButton.vue` — Component to absorb into ControlPanel
- `pages/index.vue` — Current page layout with sidebar grid
- `composables/useImageStore.ts` — `images`, `allConverted`, `isProcessing`, `convertAll`
- `composables/useConvertOptions.ts` — All option setters and state
- `utils/downloadAll.ts` — ZIP download function to wire from ControlPanel

### Requirements
- `.planning/REQUIREMENTS.md` — LAYT-01..04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useImageStore()` — already provides `images`, `allConverted`, `isProcessing`, `convertAll`
- `useConvertOptions()` — all setters already exist, used by current ControlPanel
- `downloadAll()` from `utils/downloadAll.ts` — used by current DownloadAllButton
- All i18n keys already exist from v1.0

### Established Patterns
- Nuxt UI components: USelect, USlider, UButton, UInputNumber for controls
- `v-if` for conditional rendering
- `flex flex-wrap gap-*` for responsive layouts

### Integration Points
- `pages/index.vue` — remove sidebar grid, add ControlPanel above list with v-if
- `components/ControlPanel.vue` — refactor from vertical sidebar to horizontal bar, absorb download button
- `components/DownloadAllButton.vue` — delete after absorbing into ControlPanel

</code_context>

<specifics>
## Specific Ideas

- Cada controle como bloco vertical: label pequeno em cima, input/select embaixo — economiza espaço horizontal
- Exemplo visual: `[Formato ▼] [Qualidade ━━] [Resize ▼] [Cor ■] [Converter] [Baixar Todas]`
- No mobile os blocos quebram para múltiplas linhas naturalmente via flex-wrap

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-controlpanel-layout-refactor*
*Context gathered: 2026-03-24*
