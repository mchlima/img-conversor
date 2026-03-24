# Phase 1: Scaffold - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 01-scaffold
**Areas discussed:** Styling, Página inicial, Idioma da UI

---

## Styling

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind CSS | Utility-first, ecossistema maduro com Nuxt | ✓ |
| UnoCSS | Motor atômico mais leve e rápido, compatível com sintaxe Tailwind | |
| Shadcn/Nuxt UI | Biblioteca de componentes prontos + Tailwind | |
| You decide | Claude escolhe | |

**User's choice:** Tailwind CSS
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Custom (Recommended) | Componentes escritos na mão com Tailwind | |
| Nuxt UI | Biblioteca oficial do Nuxt — botões, sliders, dropdowns prontos | ✓ |
| Headless UI | Componentes acessíveis sem estilo | |
| You decide | Claude escolhe | |

**User's choice:** Nuxt UI
**Notes:** None

---

## Página Inicial

| Option | Description | Selected |
|--------|-------------|----------|
| Single page centered | Área central com título, drop zone e controles | |
| Header + content | Header fixo com logo/nome + área de conteúdo abaixo | |
| Full-width minimal | Tela inteira sem header — só a ferramenta, máximo espaço útil | ✓ |

**User's choice:** Full-width minimal
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Img Conversor | Nome atual do projeto, sem logo — só texto | ✓ |
| Outro nome | Quero sugerir um nome diferente | |
| You decide | Claude escolhe nome e branding | |

**User's choice:** Img Conversor
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Light only | Fundo claro, visual clean | |
| Dark only | Fundo escuro, visual moderno | |
| System default | Segue a preferência do OS do usuário (light/dark) | ✓ |

**User's choice:** System default
**Notes:** None

---

## Idioma da UI

| Option | Description | Selected |
|--------|-------------|----------|
| Português BR | Labels, botões, mensagens tudo em PT-BR | |
| Inglês | Interface toda em inglês — alcance global | |
| i18n (ambos) | Suporte a múltiplos idiomas com troca dinâmica | ✓ |

**User's choice:** i18n (ambos)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| PT-BR padrão | Começa em português, usuário pode trocar para inglês | |
| EN padrão | Começa em inglês, usuário pode trocar para português | |
| Detectar browser | Usa o idioma do navegador do usuário como padrão | ✓ |

**User's choice:** Detectar browser
**Notes:** None

---

## Claude's Discretion

- Estrutura de pastas dos composables e componentes
- Configuração específica do vite-plugin-wasm e jSquash
- Definição exata dos tipos TypeScript
- Configuração do Vercel deploy

## Deferred Ideas

None — discussion stayed within phase scope.
