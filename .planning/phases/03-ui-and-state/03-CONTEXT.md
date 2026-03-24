# Phase 3: UI and State - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

UI completa da aplicação: drop zone para upload, painel de controles globais (formato, qualidade, resize, cor de fundo), lista de imagens com preview/tamanho/status, download individual, e trust signal de privacidade. Wires tudo ao pipeline de processamento (useProcessor) da Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Drop Zone
- **D-01:** Layout da drop zone a critério do Claude (tela inteira inicial que encolhe, ou área fixa — decisão técnica)
- **D-02:** Novo upload SUBSTITUI a lista existente (não acumula)
- **D-03:** Suporta drag-and-drop e clique para selecionar

### Image Cards
- **D-04:** Cada card exibe: preview thumbnail, nome do arquivo, tamanho antes/depois (com economia em %), indicador de status (idle/processando/done/erro), botão de download
- **D-05:** Cards em lista vertical (um por linha, como tabela) — não grid
- **D-06:** Botão X por imagem para remover da lista antes de converter

### Painel de Controles
- **D-07:** Posição do painel a critério do Claude (acima da lista ou sidebar lateral — baseado no layout full-width)
- **D-08:** Conversão disparada por botão "Converter" explícito (não automático)
- **D-09:** Controles globais: seletor de formato (JPEG/PNG/WebP), slider de qualidade, controles de resize (proporcional % ou exato px, mutuamente exclusivos)
- **D-10:** Color picker para cor de fundo do JPEG aparece condicionalmente (quando PNG→JPEG detectado, herdado Phase 2 D-03)

### Trust Signal
- **D-11:** Mensagem de privacidade exibida em DOIS lugares: na drop zone (visível antes do primeiro uso) E no rodapé discreto da página

### Claude's Discretion
- Componentes Nuxt UI específicos para cada controle (UInput, URange, USelect, etc.)
- Implementação do useImageStore (gerenciamento de estado das imagens)
- Estilo dos cards e animações de status
- Layout responsivo específico
- Como exibir o feedback de economia de tamanho (ex: "-67%" em verde)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, validated requirements
- `.planning/REQUIREMENTS.md` — INPT-01..04, OUTP-01..03, OUTP-05 are this phase's requirements

### Prior phase code
- `composables/useProcessor.ts` — Core conversion function (File + ConvertOptions → Blob)
- `composables/useConvertOptions.ts` — Reactive options state with resize mutual exclusion
- `types/index.ts` — ImageItem, ConvertOptions, OutputFormat, ProcessingStatus types
- `utils/hasAlpha.ts` — Transparency detection (for conditional color picker)
- `pages/index.vue` — Current page shell (to be expanded)

### Research
- `.planning/research/FEATURES.md` — Feature landscape, competitor analysis, UX patterns
- `.planning/research/ARCHITECTURE.md` — Component structure, data flow, state management patterns

### Prior decisions
- `.planning/phases/01-scaffold/01-CONTEXT.md` — D-02 Nuxt UI, D-03 full-width minimal, D-06 i18n
- `.planning/phases/02-processing-pipeline/02-CONTEXT.md` — D-02/D-03 color picker condicional, D-05 processamento sequencial

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useProcessor.convert(file, opts)` — stateless, returns Promise<Blob>
- `useConvertOptions()` — reactive state with setFormat, setQuality, setResizeMode, all setters
- `hasAlpha(file)` — returns Promise<boolean> for conditional color picker display
- `guardCanvasDimensions(w, h)` — returns { width, height, scaled }
- Nuxt UI components available: UButton, UInput, URange, USelect, UCard, UIcon, etc.
- i18n $t() function for all user-facing text

### Established Patterns
- `ssr: false` no nuxt.config — all components can use browser APIs directly
- `<ClientOnly>` wrapper for browser-dependent content
- `useState` for reactive state (used in useConvertOptions)
- Tailwind CSS utilities for styling

### Integration Points
- `pages/index.vue` — main page, currently a shell to be expanded
- `composables/useImageStore.ts` — new composable for managing image list state
- `components/DropZone.vue` — new component
- `components/ImageCard.vue` — new component
- `components/ControlPanel.vue` — new component

</code_context>

<specifics>
## Specific Ideas

- Cards em lista vertical como tabela — compacto, fácil de escanear quando há muitas imagens
- Novo upload substitui lista (não acumula) — UX simples, sem gerenciamento complexo de sessões
- Botão "Converter" explícito — usuário configura tudo antes, conversão é uma ação deliberada
- Trust signal em dois pontos — drop zone (antes do uso) + rodapé (sempre visível)
- Color picker condicional aparece apenas quando há PNG com transparência sendo convertido para JPEG

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-ui-and-state*
*Context gathered: 2026-03-24*
