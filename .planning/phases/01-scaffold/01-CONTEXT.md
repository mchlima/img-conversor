# Phase 1: Scaffold - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Nuxt 3 SSG project deployável na Vercel com tipos TypeScript base, configuração de WASM (jSquash), e fundação visual. Nenhum código de processamento de imagens nesta fase — apenas a base que todas as fases seguintes usam.

</domain>

<decisions>
## Implementation Decisions

### Styling
- **D-01:** Tailwind CSS como framework de utilitários CSS
- **D-02:** Nuxt UI como biblioteca de componentes (botões, sliders, dropdowns, cards prontos)

### Layout e Visual
- **D-03:** Layout full-width minimal — sem header fixo, sem sidebar, só a ferramenta com máximo espaço útil
- **D-04:** Nome exibido: "Img Conversor" — texto simples, sem logo
- **D-05:** Tema segue preferência do sistema operacional (light/dark) — usando mecanismo nativo do Nuxt UI

### Internacionalização
- **D-06:** i18n com suporte a PT-BR e EN
- **D-07:** Idioma padrão detectado pelo navegador do usuário (fallback: EN)
- **D-08:** Usar @nuxtjs/i18n para gerenciar traduções

### Claude's Discretion
- Estrutura de pastas dos composables e componentes
- Configuração específica do vite-plugin-wasm e jSquash
- Definição exata dos tipos TypeScript (ImageItem, ConvertOptions, enums de status)
- Configuração do Vercel deploy (preset, headers CSP para WASM)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:

### Project context
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — INFR-01, INFR-02, INFR-03 are this phase's requirements
- `.planning/research/STACK.md` — jSquash WASM configuration, vite-plugin-wasm setup, Nuxt config requirements
- `.planning/research/PITFALLS.md` — SSG/SSR pitfalls with browser APIs, ClientOnly patterns
- `docs/PROJECT_BRIEF.md` — Original project brief with stack decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — this phase establishes the patterns all future phases follow

### Integration Points
- `nuxt.config.ts` — central configuration for Tailwind, Nuxt UI, i18n, WASM plugins
- `app.vue` — root layout with NuxtPage
- `pages/index.vue` — single page where the tool lives

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key constraint: the WASM pipeline (jSquash) must be verified end-to-end at this phase to prevent blocking Phase 2.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-scaffold*
*Context gathered: 2026-03-24*
