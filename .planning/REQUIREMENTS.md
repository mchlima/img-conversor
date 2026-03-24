# Requirements: Img Conversor

**Defined:** 2026-03-24
**Core Value:** Conversão de formato + redimensionamento + controle de qualidade em uma única operação — sem fricção, sem upload para servidor, sem cadastro.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Input

- [ ] **INPT-01**: Usuário pode selecionar múltiplas imagens via clique no file picker
- [ ] **INPT-02**: Usuário pode arrastar e soltar múltiplas imagens na área de drop
- [ ] **INPT-03**: Usuário vê preview da imagem original para identificação
- [ ] **INPT-04**: Usuário vê o tamanho do arquivo original ao lado de cada imagem

### Conversion

- [ ] **CONV-01**: Usuário pode escolher formato de saída entre JPEG, PNG e WebP
- [ ] **CONV-02**: WebP é o formato de saída pré-selecionado (recomendado)
- [ ] **CONV-03**: Usuário pode ajustar qualidade de saída via slider de 1 a 100%
- [ ] **CONV-04**: Conversão funciona corretamente em Chrome, Firefox e Safari
- [ ] **CONV-05**: Nenhuma imagem é enviada para servidores — processamento 100% client-side

### Resize

- [ ] **RSZN-01**: Usuário pode redimensionar proporcionalmente via slider de 1 a 100%
- [ ] **RSZN-02**: Usuário pode definir dimensões exatas em pixels (largura × altura)
- [ ] **RSZN-03**: Os dois modos de redimensionamento são mutuamente exclusivos — ativar um desativa o outro
- [ ] **RSZN-04**: Redimensionamento proporcional mantém aspect ratio da imagem original

### Output

- [ ] **OUTP-01**: Usuário vê o tamanho do arquivo convertido ao lado de cada imagem
- [ ] **OUTP-02**: Usuário vê comparação de tamanho antes/depois (economia em bytes e %)
- [ ] **OUTP-03**: Usuário pode baixar cada imagem convertida individualmente
- [ ] **OUTP-04**: Usuário pode baixar todas as imagens convertidas em um arquivo .zip
- [ ] **OUTP-05**: Cada imagem exibe status de processamento (idle / processando / concluído / erro)

### Infraestrutura

- [ ] **INFR-01**: Projeto roda com Nuxt 3 + TypeScript
- [ ] **INFR-02**: Build SSG (`nuxt generate`) completa sem erros
- [ ] **INFR-03**: Deploy funcional na Vercel a partir do repositório
- [ ] **INFR-04**: PNG transparente convertido para JPEG renderiza com fundo branco (não preto)
- [ ] **INFR-05**: Imagens maiores que o limite de canvas do iOS Safari (16M pixels) são redimensionadas automaticamente ou rejeitadas com mensagem clara

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Usabilidade

- **USAB-01**: Usuário pode colar imagem do clipboard (Ctrl+V / Cmd+V)
- **USAB-02**: Botão "Aplicar configurações a todas" para qualidade/formato/resize
- **USAB-03**: Usuário pode reconverter ao alterar configurações sem re-upload
- **USAB-04**: Nome do arquivo de saída inclui sufixo de qualidade/formato (ex: foto-80q.webp)
- **USAB-05**: Exibição de economia em percentual ("-67%") de forma destacada

### Avançado

- **AVNC-01**: Configurações salvas no localStorage para próximas visitas
- **AVNC-02**: Override de formato/qualidade por imagem individual
- **AVNC-03**: Suporte a HEIC/HEIF como input
- **AVNC-04**: Dark mode

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| GIF animado | Canvas API perde animação; output seria frame estático sem aviso |
| AVIF como output | Encoding apenas no Chrome; inconsistente cross-browser |
| BMP/TIFF como output | Canvas não codifica nativamente nesses formatos |
| Preview do resultado (depois) | Complexidade alta, valor marginal quando tamanho antes/depois já comunica o resultado |
| Comparação visual antes/depois (slider) | Dobra uso de memória, complexidade alta, valor baixo vs tamanho numérico |
| Backend / API | Arquitetura é 100% client-side por decisão |
| Autenticação / Login | Ferramenta pública sem fricção |
| Banco de dados | Sem persistência server-side |
| Crop / Rotate / Flip | Domínio diferente; dilui o foco em conversão + otimização |
| App mobile nativo | Web-first |
| Server-side fallback para formatos não suportados | Viola constraint de privacidade client-side |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INPT-01 | — | Pending |
| INPT-02 | — | Pending |
| INPT-03 | — | Pending |
| INPT-04 | — | Pending |
| CONV-01 | — | Pending |
| CONV-02 | — | Pending |
| CONV-03 | — | Pending |
| CONV-04 | — | Pending |
| CONV-05 | — | Pending |
| RSZN-01 | — | Pending |
| RSZN-02 | — | Pending |
| RSZN-03 | — | Pending |
| RSZN-04 | — | Pending |
| OUTP-01 | — | Pending |
| OUTP-02 | — | Pending |
| OUTP-03 | — | Pending |
| OUTP-04 | — | Pending |
| OUTP-05 | — | Pending |
| INFR-01 | — | Pending |
| INFR-02 | — | Pending |
| INFR-03 | — | Pending |
| INFR-04 | — | Pending |
| INFR-05 | — | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 0
- Unmapped: 23 ⚠️

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after initial definition*
