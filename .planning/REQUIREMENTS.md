# Requirements: Img Conversor

**Defined:** 2026-03-24
**Core Value:** Conversão de formato + redimensionamento + controle de qualidade em uma única operação — sem fricção, sem upload para servidor, sem cadastro.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Input

- [x] **INPT-01**: Usuário pode selecionar múltiplas imagens via clique no file picker
- [x] **INPT-02**: Usuário pode arrastar e soltar múltiplas imagens na área de drop
- [x] **INPT-03**: Usuário vê preview da imagem original para identificação
- [x] **INPT-04**: Usuário vê o tamanho do arquivo original ao lado de cada imagem

### Conversion

- [x] **CONV-01**: Usuário pode escolher formato de saída entre JPEG, PNG e WebP
- [x] **CONV-02**: WebP é o formato de saída pré-selecionado (recomendado)
- [x] **CONV-03**: Usuário pode ajustar qualidade de saída via slider de 1 a 100%
- [x] **CONV-04**: Conversão funciona corretamente em Chrome, Firefox e Safari
- [x] **CONV-05**: Nenhuma imagem é enviada para servidores — processamento 100% client-side

### Resize

- [x] **RSZN-01**: Usuário pode redimensionar proporcionalmente via slider de 1 a 100%
- [x] **RSZN-02**: Usuário pode definir dimensões exatas em pixels (largura × altura)
- [x] **RSZN-03**: Os dois modos de redimensionamento são mutuamente exclusivos — ativar um desativa o outro
- [x] **RSZN-04**: Redimensionamento proporcional mantém aspect ratio da imagem original

### Output

- [x] **OUTP-01**: Usuário vê o tamanho do arquivo convertido ao lado de cada imagem
- [x] **OUTP-02**: Usuário vê comparação de tamanho antes/depois (economia em bytes e %)
- [x] **OUTP-03**: Usuário pode baixar cada imagem convertida individualmente
- [x] **OUTP-04**: Usuário pode baixar todas as imagens convertidas em um arquivo .zip
- [x] **OUTP-05**: Cada imagem exibe status de processamento (idle / processando / concluído / erro)

### Infraestrutura

- [x] **INFR-01**: Projeto roda com Nuxt 3 + TypeScript
- [x] **INFR-02**: Build SSG (`nuxt generate`) completa sem erros
- [x] **INFR-03**: Deploy funcional na Vercel a partir do repositório
- [x] **INFR-04**: PNG transparente convertido para JPEG renderiza com fundo branco (não preto)
- [x] **INFR-05**: Imagens maiores que o limite de canvas do iOS Safari (16M pixels) são redimensionadas automaticamente ou rejeitadas com mensagem clara

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
| INPT-01 | Phase 3 | Complete |
| INPT-02 | Phase 3 | Complete |
| INPT-03 | Phase 3 | Complete |
| INPT-04 | Phase 3 | Complete |
| CONV-01 | Phase 2 | Complete |
| CONV-02 | Phase 2 | Complete |
| CONV-03 | Phase 2 | Complete |
| CONV-04 | Phase 2 | Complete |
| CONV-05 | Phase 2 | Complete |
| RSZN-01 | Phase 2 | Complete |
| RSZN-02 | Phase 2 | Complete |
| RSZN-03 | Phase 2 | Complete |
| RSZN-04 | Phase 2 | Complete |
| OUTP-01 | Phase 3 | Complete |
| OUTP-02 | Phase 3 | Complete |
| OUTP-03 | Phase 3 | Complete |
| OUTP-04 | Phase 4 | Complete |
| OUTP-05 | Phase 3 | Complete |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 1 | Complete |
| INFR-03 | Phase 1 | Complete |
| INFR-04 | Phase 2 | Complete |
| INFR-05 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after roadmap creation*
