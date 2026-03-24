# Img Conversor

## What This Is

Site simples e moderno para converter, redimensionar e ajustar a qualidade de imagens — tudo em uma única ferramenta, sem necessidade de login ou backend. Todo o processamento acontece no browser do usuário. Voltado para produtores de conteúdo, frontend developers, donos de e-commerce e qualquer pessoa que precise otimizar imagens para web.

## Core Value

Conversão de formato + redimensionamento + controle de qualidade em uma única operação — sem fricção, sem upload para servidor, sem cadastro.

## Requirements

### Validated

- ✓ Nuxt 3 + TypeScript project scaffold — Phase 1
- ✓ SSG build (`nuxt generate`) sem erros — Phase 1
- ✓ Deploy funcional na Vercel — Phase 1
- ✓ Conversão entre formatos suportados (JPEG, PNG, WebP) — Phase 2
- ✓ Controle de qualidade via slider (1-100%) — Phase 2
- ✓ Redimensionamento proporcional via slider (1-100%) — Phase 2
- ✓ Redimensionamento por dimensões exatas (largura × altura em px) — Phase 2
- ✓ Modos de redimensionamento mutuamente exclusivos — Phase 2
- ✓ PNG transparente → JPEG com fundo branco (não preto) — Phase 2
- ✓ Guard para limite de canvas do iOS Safari — Phase 2
- ✓ Seleção de múltiplas imagens via drag-and-drop ou clique — Phase 3
- ✓ Preview da imagem original para identificação — Phase 3
- ✓ Exibição do tamanho do arquivo antes e depois da conversão — Phase 3
- ✓ Comparação de tamanho antes/depois (economia em bytes e %) — Phase 3
- ✓ Download individual por imagem processada — Phase 3
- ✓ Status de processamento por imagem (idle/processando/concluído/erro) — Phase 3
- ✓ Processamento 100% client-side — Phase 3

### Active

- [ ] Seleção de múltiplas imagens via drag-and-drop ou clique
- [ ] Controle de qualidade via slider (1-100%)
- [ ] Redimensionamento proporcional via slider (1-100%)
- [ ] Redimensionamento por dimensões exatas (largura × altura em px)
- [ ] Modos de redimensionamento mutuamente exclusivos (proporcional invalida exato e vice-versa)
- [ ] Preview da imagem original para identificação
- [ ] Exibição do tamanho do arquivo antes e depois da conversão
- [ ] Download individual por imagem processada
- [ ] Download em lote via arquivo .zip
- [ ] WebP como formato de saída padrão recomendado
- [ ] Processamento 100% client-side (nenhuma imagem enviada a servidores)

### Out of Scope

- GIF animado — Canvas API perde animação, suporte ruim no browser
- AVIF — Encoding suportado apenas no Chrome, inconsistente cross-browser
- BMP/TIFF como output — Canvas não codifica nativamente nesses formatos
- Preview do resultado (depois) — Usuário não precisa, complexidade desnecessária
- Backend/API — Todo processamento é client-side
- Autenticação/Login — Ferramenta pública sem fricção
- Banco de dados — Sem persistência server-side
- App mobile nativo — Web-first
- Configurações salvas no localStorage — Deferred, não essencial para v1

## Context

- A maioria das ferramentas online faz conversão OU redimensionamento, nunca os dois juntos com controle de qualidade
- Canvas API suporta encoding nativo para JPEG, PNG e WebP na maioria dos browsers
- Para formatos além do que o Canvas oferece, considerar libs padrão como sharp (via WASM) ou similares
- File API + Canvas API são a base do processamento client-side
- JSZip ou similar para geração do download em lote (.zip)
- Deploy como site estático (SSG) na Vercel via integração com Git

## Constraints

- **Tech stack**: Nuxt 3 + TypeScript — não negociável
- **Deploy**: Vercel com SSG — não negociável
- **Processamento**: 100% client-side — nenhuma imagem sai do browser do usuário
- **Backend**: Nenhum — zero infraestrutura server-side
- **Formatos**: Apenas formatos com suporte consistente cross-browser (JPEG, PNG, WebP)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Canvas API + libs WASM para processamento | Melhor suporte cross-browser, zero backend | — Pending |
| Excluir GIF animado e AVIF | Suporte inconsistente no browser | — Pending |
| Dois modos de resize mutuamente exclusivos | UX clara — proporcional (slider %) e exato (px) não conflitam | — Pending |
| Preview apenas do original | Reduz complexidade sem perder valor — usuário precisa identificar, não comparar | — Pending |
| Incluir comparação de tamanho antes/depois | Valor alto para o usuário com esforço baixo | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 3 completion*
