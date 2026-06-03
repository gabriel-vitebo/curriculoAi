# CurriculoAI

Aplicacao web em Nuxt 4 para analisar curriculos em PDF com IA. O usuario envia um curriculo, pode informar uma area desejada e recebe um relatorio estruturado com nota, senioridade estimada, pontos fortes, lacunas, sugestoes de melhoria, resumo otimizado e dicas para entrevista.

O produto tambem permite copiar o relatorio em texto e baixar uma versao em PDF gerada no servidor.

## Funcionalidades

- Upload de curriculo em PDF por selecao ou drag and drop.
- Validacao de tipo e tamanho do arquivo.
- Extracao de texto do PDF no backend com `pdf-parse`.
- Analise estruturada com OpenAI Responses API.
- Campo opcional de area desejada para avaliar aderencia do curriculo a uma vaga ou objetivo.
- Relatorio com nota geral, senioridade, avaliacao por secao e distribuicao visual da qualidade.
- Listas de pontos fortes, pontos fracos, habilidades identificadas, sugestoes e informacoes ausentes.
- Resumo profissional otimizado para reaproveitar no curriculo.
- Copia do relatorio para a area de transferencia.
- Download do relatorio em PDF via Puppeteer.
- Cache temporario para evitar reanalises duplicadas do mesmo arquivo e area.

## Stack

- `Nuxt 4`
- `Vue 3`
- `Tailwind CSS`
- `Nitro` server routes
- `OpenAI Responses API`
- `pdf-parse`
- `@napi-rs/canvas`
- `Puppeteer`
- `Vitest` com `@nuxt/test-utils`
- `ESLint`
- `semantic-release`

## Requisitos

- Node.js `24`
- npm
- Chave da OpenAI para usar a analise de curriculos

As versoes de Node tambem estao registradas em `.nvmrc` e `.node-version`.

## Instalacao

```bash
npm ci
```

Para iniciar o ambiente local:

```bash
npm run dev
```

Por padrao, a aplicacao fica disponivel em:

```text
http://localhost:3000
```

## Variaveis De Ambiente

Crie um arquivo `.env` na raiz do projeto ou exporte as variaveis no ambiente.

```bash
NUXT_OPENAI_API_KEY=sua_chave_aqui
```

Variaveis opcionais:

```bash
NUXT_OPENAI_MODEL=gpt-4.1-mini
NUXT_CV_MAX_PDF_BYTES=5242880
NUXT_CV_MIN_TEXT_CHARS=180
NUXT_CV_MAX_TEXT_CHARS_TO_AI=12000
NUXT_CV_DUPLICATE_WINDOW_MS=120000
APP_VERSION=dev
```

`NUXT_OPENAI_API_KEY` e obrigatoria para `POST /api/cv/analyze` e `POST /api/openai/analyze`.

As demais configuracoes controlam modelo, limite de upload, minimo de texto extraido, tamanho maximo enviado para IA, janela de deduplicacao e versao exibida no relatorio.

## Como Funciona

1. O usuario seleciona um arquivo PDF na pagina inicial.
2. Opcionalmente informa uma area desejada, como `Programacao front-end`.
3. O frontend navega para `/resultado` levando nome do arquivo e area na query string.
4. A pagina de resultado envia `multipart/form-data` para `POST /api/cv/analyze`.
5. O backend valida o PDF, extrai texto e monta um prompt objetivo.
6. A OpenAI retorna um JSON seguindo schema estrito.
7. O backend normaliza a resposta e devolve o relatorio para o frontend.
8. O usuario pode copiar o texto do relatorio ou gerar um PDF com `POST /api/cv/report`.

Quando a area desejada e preenchida, a nota geral considera fortemente a aderencia do curriculo a esse objetivo. Sem area informada, a analise avalia qualidade geral, clareza, organizacao, impacto e completude.

## Estrutura Do Projeto

```text
app/
  app.vue
  assets/css/main.css
  components/
  composables/
  pages/
  types/
config/
  app-version.ts
server/
  api/
public/
```

Arquivos principais:

- `app/pages/index.vue`: tela inicial, upload do PDF e area desejada.
- `app/pages/resultado/index.vue`: execucao da analise, renderizacao do relatorio, copia e download.
- `app/composables/cv-analysis-state.ts`: estado compartilhado do arquivo, area e resultado.
- `app/types/cv-analysis.ts`: contrato TypeScript do relatorio.
- `server/api/cv/analyze.post.ts`: rota principal de analise de curriculo.
- `server/api/cv/report.post.ts`: geracao de PDF do relatorio com Puppeteer.
- `server/api/openai/analyze.post.ts`: rota auxiliar para enviar texto simples para OpenAI.
- `server/api/health.get.ts`: health check.
- `config/app-version.ts`: resolucao da versao exibida na aplicacao.

## Endpoints

### `POST /api/cv/analyze`

Analisa um curriculo em PDF.

Entrada: `multipart/form-data`

- `file`: arquivo PDF do curriculo.
- `desiredArea`: string opcional com a area desejada.

Saida:

```json
{
  "analysis": {
    "areaAlvo": "Programacao front-end",
    "resumoProfissional": "...",
    "resumoOtimizado": "...",
    "pontosFortes": [],
    "pontosFracos": [],
    "habilidadesIdentificadas": [],
    "senioridadeEstimada": "junior",
    "notaGeral": 7.5,
    "avaliacaoPorSecao": [],
    "distribuicaoQualidade": [],
    "sugestoesMelhoria": [],
    "dicasEntrevista": [],
    "observacoesAusentes": [],
    "avisoAutomacao": "..."
  },
  "cached": false
}
```

Possiveis falhas incluem arquivo ausente, tipo invalido, PDF grande demais, texto insuficiente, erro de leitura do PDF ou falha na chamada da OpenAI.

### `POST /api/cv/report`

Gera um PDF a partir de uma analise ja obtida.

Entrada: `application/json`

- `analysis`: objeto `CvAnalysisResult`.
- `fileName`: nome original do curriculo.
- `areaLabel`: area exibida no relatorio.

Saida: arquivo `application/pdf` com `Content-Disposition: attachment`.

### `POST /api/openai/analyze`

Endpoint auxiliar para testar uma entrada textual simples com o modelo configurado.

Entrada:

```json
{
  "input": "Texto para analisar"
}
```

Saida:

```json
{
  "model": "gpt-4.1-mini",
  "outputText": "..."
}
```

### `GET /api/health`

Retorna status simples da aplicacao.

```json
{
  "ok": true,
  "timestamp": "2026-06-03T00:00:00.000Z"
}
```

## Scripts

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de producao
npm run preview      # preview do build
npm run generate     # geracao estatica do Nuxt
npm run lint         # verificacao ESLint
npm run lint:fix     # correcao automatica do ESLint
npm test             # testes unitarios/snapshot
npm run test:watch   # testes em modo watch
npm run release:dry  # simula release sem publicar
npm run release      # publica release via semantic-release
```

## Testes

Os testes usam `Vitest` com ambiente `nuxt`.

```bash
npm test
```

A suite atual cobre principalmente componentes de UI e snapshots em `app/components/**/__tests__`.

## Build E Producao

```bash
npm run build
npm run preview
```

Para producao, configure ao menos `NUXT_OPENAI_API_KEY`. O endpoint de relatorio usa Puppeteer em modo headless com `--no-sandbox` e `--disable-setuid-sandbox`, o que facilita execucao em containers e ambientes restritos.

## Release

O projeto usa `semantic-release` na branch `main`, com preset `conventionalcommits`.

O fluxo atual:

- analisa commits;
- gera notas de release;
- atualiza `CHANGELOG.md`;
- cria commit `chore(release): <versao> [skip ci]`;
- publica release no GitHub.

Commits do tipo `chore` tambem geram release `patch`, conforme `release.config.mjs`.

## Licenca

MIT. Veja `LICENSE`.
