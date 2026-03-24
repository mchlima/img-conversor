# Img Conversor

## What This Is

Site moderno para converter, redimensionar e ajustar a qualidade de imagens — tudo em uma única ferramenta, sem login ou backend. Todo o processamento acontece no browser do usuário via Canvas API e jSquash WASM. Suporta JPEG, PNG e WebP com processamento cross-browser (Chrome, Firefox, Safari). Voltado para produtores de conteúdo, frontend developers, donos de e-commerce e qualquer pessoa que precise otimizar imagens para web.

## Core Value

Conversão de formato + redimensionamento + controle de qualidade em uma única operação — sem fricção, sem upload para servidor, sem cadastro.

## Requirements

### Validated

- ✓ Nuxt 3 + TypeScript project scaffold — v1.0
- ✓ SSG build (`nuxt generate`) sem erros — v1.0
- ✓ Deploy funcional na Vercel — v1.0
- ✓ Conversão entre formatos suportados (JPEG, PNG, WebP) — v1.0
- ✓ Controle de qualidade via slider (1-100%) — v1.0
- ✓ Redimensionamento proporcional via slider (1-100%) — v1.0
- ✓ Redimensionamento por dimensões exatas (largura × altura em px) — v1.0
- ✓ Modos de redimensionamento mutuamente exclusivos — v1.0
- ✓ PNG transparente → JPEG com fundo branco (cor escolhida pelo usuário) — v1.0
- ✓ Guard para limite de canvas do iOS Safari (16M pixels) — v1.0
- ✓ Seleção de múltiplas imagens via drag-and-drop ou clique — v1.0
- ✓ Preview da imagem original para identificação — v1.0
- ✓ Exibição do tamanho do arquivo antes e depois da conversão — v1.0
- ✓ Comparação de tamanho antes/depois (economia em bytes e %) — v1.0
- ✓ Download individual por imagem processada — v1.0
- ✓ Status de processamento por imagem (idle/processando/concluído/erro) — v1.0
- ✓ Processamento 100% client-side — v1.0
- ✓ Download em lote via arquivo .zip — v1.0
- ✓ WebP como formato de saída padrão recomendado — v1.0
- ✓ i18n PT-BR + EN com detecção de idioma do browser — v1.0
- ✓ Trust signal de privacidade (drop zone + rodapé) — v1.0

- ✓ ControlPanel como barra horizontal acima da lista — v1.1
- ✓ ControlPanel visível apenas com imagens selecionadas — v1.1
- ✓ Botão "Baixar Todas" dentro do ControlPanel — v1.1
- ✓ Botão "Baixar Todas" visível apenas com imagens convertidas — v1.1

### Active

(Nenhum — v1.1 shipped. Próximos requisitos definidos em `/gsd:new-milestone`)

### Out of Scope

- GIF animado — Canvas API perde animação, suporte ruim no browser
- AVIF — Encoding suportado apenas no Chrome, inconsistente cross-browser
- BMP/TIFF como output — Canvas não codifica nativamente nesses formatos
- Preview do resultado (depois) — Complexidade alta, valor marginal
- Backend/API — Todo processamento é client-side
- Autenticação/Login — Ferramenta pública sem fricção
- Banco de dados — Sem persistência server-side
- App mobile nativo — Web-first
- Configurações salvas no localStorage — Deferred para v1.x
- Crop/Rotate/Flip — Domínio diferente, dilui o foco

## Context

Shipped v1.0 MVP com ~19,000 LOC (TypeScript + Vue + JSON).
Tech stack: Nuxt 4.4.2, @nuxt/ui, @nuxtjs/i18n, @jsquash/webp + @jsquash/resize (WASM), fflate (ZIP), Tailwind CSS.
Deployed to Vercel como SSG estático.
jSquash WASM usado para WebP encoding (Safari não suporta via Canvas).
Processamento sequencial por estabilidade de memória.

## Constraints

- **Tech stack**: Nuxt 3 + TypeScript — não negociável
- **Deploy**: Vercel com SSG — não negociável
- **Processamento**: 100% client-side — nenhuma imagem sai do browser do usuário
- **Backend**: Nenhum — zero infraestrutura server-side
- **Formatos**: Apenas formatos com suporte consistente cross-browser (JPEG, PNG, WebP)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Canvas API + jSquash WASM para processamento | Canvas para JPEG/PNG, jSquash para WebP (Safari) | ✓ Good |
| Excluir GIF animado e AVIF | Suporte inconsistente no browser | ✓ Good |
| Dois modos de resize mutuamente exclusivos | UX clara — proporcional e exato não conflitam | ✓ Good |
| Preview apenas do original | Reduz complexidade sem perder valor | ✓ Good |
| Comparação de tamanho antes/depois | Valor alto para o usuário com esforço baixo | ✓ Good |
| fflate para ZIP (não JSZip) | Mais rápido, async, mantido ativamente | ✓ Good |
| Processamento sequencial | Estabilidade de memória > velocidade | ✓ Good |
| Color picker condicional para JPEG background | Aparece só quando PNG→JPEG com transparência | ✓ Good |
| Nuxt UI como biblioteca de componentes | Componentes prontos, integrado com Nuxt | ✓ Good |
| i18n com detecção de browser | PT-BR + EN, sem prefixo de URL | ✓ Good |
| unsafe-inline no CSP | Nuxt SSG gera scripts inline, necessário | ✓ Good (trade-off aceito) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after v1.1 milestone*
