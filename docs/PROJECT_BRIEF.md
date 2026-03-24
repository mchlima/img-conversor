# PROJECT_BRIEF.md

## Visão Geral do Produto

Site simples e moderno para converter, redimensionar e ajustar a qualidade de imagens — tudo em uma única ferramenta, sem necessidade de login ou backend.

**Problema resolvido:** A maioria das ferramentas online converte OU redimensiona. Esta faz os dois ao mesmo tempo, com controle total sobre qualidade e dimensões.

---

## Público-Alvo

- Produtores de conteúdo
- Frontend developers
- Donos de e-commerces
- Qualquer pessoa que precise otimizar imagens para web

---

## Diferencial

Combinação de conversão de formato + redimensionamento + controle de qualidade em uma única ferramenta com interface simples e sem fricção (sem cadastro, sem upload para servidor).

---

## Funcionalidades — MVP

### Must Have

- **Seleção de arquivos:** Usuário seleciona uma ou mais imagens de qualquer formato (JPEG, PNG, GIF, BMP, TIFF, AVIF, WebP, etc.)
- **Formato de saída:** Usuário escolhe o formato de destino (WebP como padrão recomendado, mas qualquer formato suportado disponível)
- **Controle de qualidade:** Slider de 1 a 100% para definir a qualidade do arquivo de saída
- **Redimensionamento proporcional:** Slider de 1 a 100% para escalar as dimensões (ex: imagem de 2000×2000px com 50% → 1000×1000px)
- **Download individual:** Botão "Baixar" por arquivo processado
- **Download em lote:** Botão "Baixar todas" que gera um arquivo `.zip` com todas as imagens convertidas

### Fluxo Principal do Usuário

1. Usuário seleciona as imagens (drag and drop ou clique)
2. Usuário define as configurações de saída: formato, qualidade e redimensionamento
3. Usuário confirma o processamento
4. Site processa as imagens no browser (client-side)
5. Usuário baixa individualmente ou em lote (zip)

### Nice to Have (fora do MVP)

- Preview das imagens antes e depois
- Exibição do tamanho do arquivo antes e depois da conversão
- Configurações salvas no localStorage para próximas visitas

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Nuxt 3 + TypeScript |
| Processamento de imagens | Client-side (browser APIs — Canvas, File API) |
| Geração de ZIP | `JSZip` ou similar |
| Backend | Nenhum |
| Banco de dados | Nenhum |
| Autenticação | Nenhuma |

> Todo o processamento ocorre no browser do usuário. Nenhuma imagem é enviada para servidores.

---

## Infraestrutura e Deploy

- **Plataforma:** Vercel
- **Tipo de deploy:** Site estático / SSG (sem servidor)
- **CI/CD:** Via integração Vercel + Git (automático no push para `main`)

---

## Critérios de Verificação (Definition of Done)

- [ ] Usuário consegue selecionar múltiplas imagens de diferentes formatos
- [ ] Conversão para WebP funciona corretamente
- [ ] Slider de qualidade afeta o peso do arquivo de saída de forma perceptível
- [ ] Slider de redimensionamento produz imagem com dimensões proporcionais corretas
- [ ] Download individual funciona para cada imagem convertida
- [ ] Download em lote gera `.zip` válido com todas as imagens
- [ ] Build bem-sucedido (`nuxt build` sem erros)
- [ ] Deploy na Vercel funcional a partir do repositório

---

## Restrições e Decisões Técnicas Fechadas

- **Sem backend:** Todo processamento é client-side. Não haverá upload de imagens para nenhum servidor.
- **Sem autenticação:** Ferramenta pública, sem login.
- **Sem banco de dados:** Sem persistência de dados além do que o browser oferece nativamente.
- **Framework:** Nuxt 3 com TypeScript — não negociável.
- **Deploy:** Vercel — não negociável.