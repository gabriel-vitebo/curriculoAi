# CurriculoAI

Aplicacao web em `Nuxt 4` para analise de curriculos em PDF com apoio da OpenAI.

O usuario faz upload do curriculo, opcionalmente informa uma area-alvo como `Programacao front-end`, e recebe um relatorio com:

- nota geral
- senioridade estimada
- avaliacao por secao
- distribuicao visual da qualidade
- pontos fortes e fracos
- sugestoes de melhoria
- resumo otimizado
- dicas para entrevista
- observacoes ausentes ou nao identificadas

Quando a area desejada e informada, a nota deixa de ser apenas uma avaliacao generica de qualidade e passa a considerar aderencia do curriculo ao contexto desejado.

## Stack

- `Nuxt 4`
- `Vue 3`
- `Tailwind CSS`
- `Vitest` + `@nuxt/test-utils`
- `ESLint`
- `semantic-release`
- `OpenAI Responses API`
- `pdf-parse`

## Como O Produto Funciona

### Fluxo do usuario

1. O usuario seleciona um arquivo PDF na pagina inicial.
2. Opcionalmente informa a area desejada.
3. O usuario clica em `Enviar para analise`.
4. A aplicacao envia o PDF para a rota `POST /api/cv/analyze`.
5. O servidor extrai o texto do PDF.
6. O texto e enviado para a OpenAI com um prompt estruturado.
7. O frontend exibe o relatorio completo na tela de resultado.

### Regra da area desejada

- Se a area for preenchida, a analise considera o quanto o curriculo esta alinhado com essa area.
- Se a area ficar vazia, o comportamento volta ao modo original: analise generica do curriculo.

Exemplo:

- Um curriculo pode estar muito bem escrito.
- Mesmo assim, se a pessoa informar `Programacao front-end` e o curriculo nao mostrar experiencia relevante nessa area, a nota pode cair.

## Arquitetura

### Frontend

Principais arquivos:

- [app/pages/index.vue](/Users/user/Documents/projetos/curriculoAi/app/pages/index.vue)
  Tela inicial com selecao de PDF, campo de area desejada e CTA de envio.
- [app/pages/resultado/index.vue](/Users/user/Documents/projetos/curriculoAi/app/pages/resultado/index.vue)
  Tela que dispara a analise, trata loading/erro e renderiza o relatorio.
- [app/composables/cv-analysis-state.ts](/Users/user/Documents/projetos/curriculoAi/app/composables/cv-analysis-state.ts)
  Estado compartilhado do arquivo selecionado, area desejada e resultado da analise.
- [app/types/cv-analysis.ts](/Users/user/Documents/projetos/curriculoAi/app/types/cv-analysis.ts)
  Tipos TypeScript do contrato de analise.

### Backend

Principais rotas:

- [server/api/cv/analyze.post.ts](/Users/user/Documents/projetos/curriculoAi/server/api/cv/analyze.post.ts)
  Rota principal da aplicacao. Faz validacao do arquivo, extracao do PDF, prompt da OpenAI, normalizacao do resultado e cache de deduplicacao.
- [server/api/openai/analyze.post.ts](/Users/user/Documents/projetos/curriculoAi/server/api/openai/analyze.post.ts)
  Endpoint generico para enviar um texto simples para a OpenAI.
- [server/api/health.get.ts](/Users/user/Documents/projetos/curriculoAi/server/api/health.get.ts)
  Health-check simples da aplicacao.

### UI Components

Os componentes ficam em `app/components` e possuem testes de snapshot cobrindo toda a pasta.

## Estrutura De Pastas

```text
app/
  app.vue
  assets/css/main.css
  components/
  composables/
  pages/
  types/
server/
  api/
.github/
  workflows/
config/
```

## Requisitos

- `Node.js 24`
- `npm`

Arquivos de referencia de versao:

- [/.nvmrc](/Users/user/Documents/projetos/curriculoAi/.nvmrc)
- [/.node-version](/Users/user/Documents/projetos/curriculoAi/.node-version)

## Instalacao

```bash
npm ci
```

Se o lockfile estiver fora de sincronia com o `package.json`, rode:

```bash
npm install
```

e commit o `package-lock.json` atualizado.

## Variaveis De Ambiente

As configuracoes principais estao em [nuxt.config.ts](/Users/user/Documents/projetos/curriculoAi/nuxt.config.ts).

Como o projeto usa `runtimeConfig`, as variaveis podem ser passadas como variaveis de ambiente do Nuxt.

### Obrigatoria

```bash
NUXT_OPENAI_API_KEY=sua_chave_aqui
```

### Opcionais

```bash
NUXT_OPENAI_MODEL=gpt-4.1-mini
NUXT_CV_MAX_PDF_BYTES=5242880
NUXT_CV_MIN_TEXT_CHARS=180
NUXT_CV_MAX_TEXT_CHARS_TO_AI=12000
NUXT_CV_DUPLICATE_WINDOW_MS=120000
```

### O que cada uma faz

- `NUXT_OPENAI_API_KEY`
  Chave da OpenAI usada no backend.
- `NUXT_OPENAI_MODEL`
  Modelo usado na Responses API.
- `NUXT_CV_MAX_PDF_BYTES`
  Tamanho maximo permitido para upload do PDF.
- `NUXT_CV_MIN_TEXT_CHARS`
  Quantidade minima de texto extraido para a analise ser considerada valida.
- `NUXT_CV_MAX_TEXT_CHARS_TO_AI`
  Limite de caracteres enviados para o modelo.
- `NUXT_CV_DUPLICATE_WINDOW_MS`
  Janela de tempo usada no cache de deduplicacao.

## Rodando Em Desenvolvimento

```bash
npm run dev
```

Aplicacao disponivel em:

```text
http://localhost:3000
```

## Scripts Disponiveis

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:fix
npm test
npm run test:watch
npm run generate
npm run release:dry
npm run release
```

## Endpoints

### `POST /api/cv/analyze`

Rota principal do produto.

#### Entrada

`multipart/form-data`

Campos esperados:

- `file`: PDF do curriculo
- `desiredArea`: string opcional

#### Comportamento

- valida tipo e tamanho do arquivo
- extrai texto com `pdf-parse`
- rejeita curriculos com pouco conteudo
- monta prompt com ou sem area-alvo
- solicita resposta estruturada em JSON para a OpenAI
- normaliza dados faltantes
- retorna um objeto pronto para o frontend

### `POST /api/openai/analyze`

Endpoint auxiliar para enviar um `input` textual simples para a OpenAI.

### `GET /api/health`

Retorna:

```json
{
  "ok": true,
  "timestamp": "2026-03-28T00:00:00.000Z"
}
```

## Cache E Deduplicacao

A rota principal usa um cache simples em memoria do processo para evitar recomputar a mesma analise em uma janela curta.

Hoje a chave de deduplicacao considera:

- IP da requisicao
- hash do PDF
- hash da area desejada

Isso evita reutilizar uma analise antiga quando o usuario envia o mesmo PDF, mas muda a area.

Observacao importante:

- esse cache e util para desenvolvimento e pequenas cargas
- ele nao e persistente
- ele nao e compartilhado entre multiplas instancias
- ele e perdido quando o processo reinicia

Se o projeto crescer, o ideal e migrar para um cache externo como Redis.

## Testes

O projeto usa `Vitest` com ambiente `nuxt`.

Rodar a suite:

```bash
npm test
```

Hoje a base possui testes de snapshot para todos os componentes em `app/components`.

## Qualidade De Codigo

Lint:

```bash
npm run lint
```

Correcao automatica:

```bash
npm run lint:fix
```

## Build De Producao

```bash
npm run build
```

Para testar localmente o build:

```bash
npm run preview
```

## CI E Release

### Testes automatizados

Workflow:

- [run-tests.yml](/Users/user/Documents/projetos/curriculoAi/.github/workflows/run-tests.yml)

Executa em:

- `push`
- `pull_request`

Passos:

1. checkout
2. setup do Node via `.nvmrc`
3. `npm ci`
4. `npm test`

### Release automatizada

Workflow:

- [release.yml](/Users/user/Documents/projetos/curriculoAi/.github/workflows/release.yml)

Executa em `push` para `main` e usa `semantic-release`.

Passos:

1. checkout com historico completo
2. setup do Node via `.nvmrc`
3. `npm ci`
4. `npm run build`
5. `npm run release`

## Convencao De Commits

O projeto usa `semantic-release`, entao e recomendado usar `Conventional Commits`.

Exemplos:

```bash
feat: add area-based CV analysis
fix: prevent cache reuse when desired area changes
docs: rewrite project README
```

## Limitacoes Atuais

- cache apenas em memoria
- sem autenticacao
- sem persistencia de historico de analises
- sem fila assicrona para processamento pesado
- dependencia de texto extraivel do PDF
- a qualidade da resposta depende da qualidade do curriculo e do modelo configurado

## Melhorias Futuras Sugeridas

- comparacao por descricao de vaga, nao apenas area
- historico local ou persistente de analises
- exportacao do relatorio em PDF
- observabilidade estruturada
- rate limiting
- testes do backend para a rota `POST /api/cv/analyze`
- cache distribuido

## Troubleshooting

### `OPENAI_API_KEY nao configurada no servidor`

Defina:

```bash
NUXT_OPENAI_API_KEY=...
```

### `npm ci` falha no CI

Confira se:

- o workflow esta usando a versao do Node definida em `.nvmrc`
- `package.json` e `package-lock.json` estao sincronizados

### PDF valido, mas analise falha

Possiveis causas:

- PDF com texto nao extraivel
- arquivo grande demais
- pouco texto util no curriculo
- falha temporaria da OpenAI

## Licenca

Este projeto esta licenciado sob a licenca `MIT`.

Veja o arquivo [LICENSE](/Users/user/Documents/projetos/curriculoAi/LICENSE).
