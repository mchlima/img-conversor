# Requirements: Img Conversor v1.4

**Defined:** 2026-03-24
**Core Value:** Conversão de formato + redimensionamento + controle de qualidade em uma única operação — sem fricção.

## v1.4 Requirements

### Resize

- [ ] **RSZN-10**: No modo "Exato (px)", o ControlPanel define valores globais de largura/altura como base padrão para todas as imagens
- [ ] **RSZN-11**: Cada ImageCard exibe campos de largura/altura individuais quando o modo "Exato (px)" está ativo, pré-preenchidos com a resolução original da imagem
- [ ] **RSZN-12**: Usuário pode sobrescrever largura/altura em qualquer card individual, independente do valor global
- [ ] **RSZN-13**: Alteração no valor global atualiza apenas imagens que não foram manualmente sobrescritas (override)
- [ ] **RSZN-14**: Campos de largura/altura por imagem mantêm proporção (alterar largura ajusta altura proporcionalmente e vice-versa)
- [ ] **RSZN-15**: Valores por imagem não aceitam valores maiores que a resolução original da imagem

## Out of Scope

| Feature | Reason |
|---------|--------|
| Override de formato/qualidade por imagem | Complexidade alta, fora do foco deste milestone |
| Modo proporcional por imagem | % global já funciona bem para todas as imagens |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RSZN-10 | Phase 8 | Pending |
| RSZN-11 | Phase 8 | Pending |
| RSZN-12 | Phase 8 | Pending |
| RSZN-13 | Phase 8 | Pending |
| RSZN-14 | Phase 8 | Pending |
| RSZN-15 | Phase 8 | Pending |

**Coverage:**
- v1.4 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-24*
