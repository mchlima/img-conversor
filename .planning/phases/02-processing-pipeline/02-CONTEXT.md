# Phase 2: Processing Pipeline - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Composable `useProcessor` que converte imagens (JPEG/PNG/WebP) com controle de qualidade e redimensionamento (proporcional + exato), funcionando corretamente em Chrome, Firefox e Safari — incluindo todos os edge cases silenciosos (PNG transparente→JPEG, iOS canvas limit, WebP encoding no Safari via jSquash WASM).

</domain>

<decisions>
## Implementation Decisions

### iOS Safari Canvas Limit
- **D-01:** Claude's discretion — escolher entre auto-redimensionar para caber no limite ou rejeitar com mensagem clara. O importante é que a imagem não seja silenciosamente corrompida (saída preta/em branco).

### PNG→JPEG Background Color
- **D-02:** Quando PNG com transparência é convertido para JPEG, o usuário escolhe a cor de fundo via color picker
- **D-03:** O color picker só aparece quando necessário — quando há pelo menos uma imagem PNG com transparência sendo convertida para JPEG
- **D-04:** Cor padrão: branco (#FFFFFF)

### Processamento em Lote
- **D-05:** Processar imagens sequencialmente (uma por vez) — priorizar estabilidade e uso de memória sobre velocidade

### Resize Modes
- **D-06:** Dois modos mutuamente exclusivos conforme REQUIREMENTS.md: proporcional (slider %) e exato (largura × altura px). Ativar um desativa o outro. (Herdado de PROJECT.md)

### Claude's Discretion
- Arquitetura interna do composable `useProcessor`
- Uso de Canvas API vs jSquash WASM para cada formato
- Estratégia de cleanup de memória (canvas.width = 0, URL.revokeObjectURL)
- Detecção de transparência em PNGs
- Implementação do guard de pixels do iOS Safari

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — CONV-01..05, RSZN-01..04, INFR-04, INFR-05 are this phase's requirements

### Research
- `.planning/research/STACK.md` — jSquash WASM setup, Canvas API vs jSquash for encoding, Safari WebP gap
- `.planning/research/PITFALLS.md` — PNG→JPEG black background, iOS 16M pixel limit, toDataURL trap, canvas cleanup, JSZip memory
- `.planning/research/ARCHITECTURE.md` — useProcessor composable design, data flow, OffscreenCanvas

### Existing code
- `types/index.ts` — ImageItem, ConvertOptions, OutputFormat, ProcessingStatus types already defined
- `nuxt.config.ts` — WASM plugin config, jSquash optimizeDeps exclusion
- `pages/index.vue` — jSquash dynamic import pattern established in onMounted

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `types/index.ts`: `ImageItem`, `ConvertOptions`, `OutputFormat`, `ProcessingStatus` — tipos base do pipeline já definidos
- `@jsquash/webp` — já instalado e verificado carregando via WASM no build
- `vite-plugin-wasm` — configurado no `nuxt.config.ts`

### Established Patterns
- Dynamic import de WASM dentro de `onMounted` (ver `pages/index.vue`)
- `<ClientOnly>` wrapper para código que usa browser APIs
- `ssr: false` no nuxt.config — simplifica uso de Canvas/File API

### Integration Points
- `composables/useProcessor.ts` — novo composable a ser criado
- `types/index.ts` — pode precisar de extensão (ex: `BackgroundColor` type para o color picker)
- Pipeline: `File → Canvas drawImage → resize → encode (Canvas toBlob ou jSquash) → Blob`

</code_context>

<specifics>
## Specific Ideas

- Color picker para fundo do JPEG só aparece condicionalmente — quando PNG transparente está sendo convertido para JPEG
- O pipeline deve usar jSquash/WASM para WebP encoding no Safari (Canvas toBlob não suporta WebP no Safari)
- Processamento sequencial para estabilidade — uma imagem por vez
- `ConvertOptions.resizeMode` já tem 'none' | 'proportional' | 'exact' definido nos tipos

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-processing-pipeline*
*Context gathered: 2026-03-24*
