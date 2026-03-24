# Phase 2: Processing Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 02-processing-pipeline
**Areas discussed:** iOS limit, PNG→JPEG fundo, Processamento

---

## iOS Safari Canvas Limit

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-redimensionar | Reduzir automaticamente para caber no limite, avisar o usuário | |
| Rejeitar com erro | Bloquear a imagem com mensagem clara explicando o limite | |
| You decide | Claude escolhe a melhor abordagem | ✓ |

**User's choice:** You decide
**Notes:** None

---

## PNG→JPEG Background Color

| Option | Description | Selected |
|--------|-------------|----------|
| Sempre branco | Mais simples, funciona para 95% dos casos | |
| Usuário escolhe | Color picker para o usuário definir a cor de fundo | ✓ |
| You decide | Claude escolhe | |

**User's choice:** Usuário escolhe
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Só quando necessário | Aparece apenas se há PNG com transparência sendo convertido para JPEG | ✓ |
| Sempre visível | O campo de cor de fundo fica sempre disponível nos controles | |

**User's choice:** Só quando necessário
**Notes:** None

---

## Processamento em Lote

| Option | Description | Selected |
|--------|-------------|----------|
| Sequencial | Uma por vez — menos memória, mais lento, mais seguro | ✓ |
| Paralelo (2-3) | 2-3 imagens simultâneas — mais rápido, mais memória | |
| You decide | Claude escolhe baseado em benchmarks | |

**User's choice:** Sequencial
**Notes:** None

---

## Claude's Discretion

- Arquitetura interna do useProcessor
- Canvas API vs jSquash WASM por formato
- Cleanup de memória
- Detecção de transparência em PNGs
- Guard de pixels do iOS Safari

## Deferred Ideas

None — discussion stayed within phase scope.
