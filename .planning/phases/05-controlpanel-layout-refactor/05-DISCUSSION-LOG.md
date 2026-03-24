# Phase 5: ControlPanel Layout Refactor - Discussion Log

> **Audit trail only.**

**Date:** 2026-03-24
**Phase:** 05-controlpanel-layout-refactor
**Areas discussed:** Layout da barra

---

## Layout da Barra

| Option | Description | Selected |
|--------|-------------|----------|
| Uma linha com wrap | Flexbox horizontal, quebrando no mobile | |
| Duas linhas fixas | Linha 1: controles, Linha 2: ações | |
| You decide | Claude escolhe | |
| Custom | Labels em cima, fields embaixo, flexbox horizontal com wrap | ✓ |

**User's choice:** Flexbox horizontal com cada item como bloco vertical (label em cima, field embaixo), wrap no mobile.
**Notes:** User specified "campos em baixo dos títulos pra economizar espaço"

---

## Claude's Discretion

- Espaçamento e gaps
- Breakpoints de wrap
- Organização do resize no espaço horizontal
- Animações de show/hide

## Deferred Ideas

None.
