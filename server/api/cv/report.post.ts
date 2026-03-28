import { createError, setHeader, readBody } from 'h3'
import puppeteer from 'puppeteer'
import type { CvAnalysisResult } from '~/types/cv-analysis'

type ReportRequestBody = {
  analysis?: CvAnalysisResult
  fileName?: string
  areaLabel?: string
}

const BROWSER_KEY = '__curriculoAiReportBrowser'

function getGlobalScope() {
  return globalThis as typeof globalThis & {
    [BROWSER_KEY]?: ReturnType<typeof puppeteer.launch>
  }
}

async function getBrowser() {
  const globalScope = getGlobalScope()

  if (!globalScope[BROWSER_KEY]) {
    globalScope[BROWSER_KEY] = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }

  return globalScope[BROWSER_KEY]
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeFileName(value: string) {
  const normalizedName = value.replace(/\.pdf$/i, '').trim()
  const baseName = normalizedName || 'curriculo-ai-relatorio'

  return `${baseName}-relatorio.pdf`
}

function buildContentDisposition(fileName: string) {
  const safeAsciiFileName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/["\r\n]/g, '')
    .replace(/[^\x20-\x7e]/g, '')

  const encodedFileName = encodeURIComponent(fileName)

  return `attachment; filename="${safeAsciiFileName}"; filename*=UTF-8''${encodedFileName}`
}

function renderList(items: string[]) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
}

function renderSectionBars(analysis: CvAnalysisResult) {
  return analysis.avaliacaoPorSecao.map((item) => `
    <div class="section-bar-row">
      <span class="section-bar-label">${escapeHtml(item.label)}</span>
      <div class="section-bar-track">
        <div class="section-bar-fill" style="width: ${item.score * 10}%; background: ${escapeHtml(item.color)};"></div>
      </div>
      <strong class="section-bar-score">${item.score}</strong>
    </div>
  `).join('')
}

function renderDistributionLegend(analysis: CvAnalysisResult) {
  return analysis.distribuicaoQualidade.map((item) => `
    <li>
      <span class="legend-dot" style="background:${escapeHtml(item.color)};"></span>
      <strong>${item.value}%</strong> ${escapeHtml(item.label)}
    </li>
  `).join('')
}

function renderDistributionSummary(analysis: CvAnalysisResult) {
  return analysis.distribuicaoQualidade.map((item) => `
    <div class="summary-row">
      <span class="legend-dot" style="background:${escapeHtml(item.color)};"></span>
      <span><strong>${item.value}%</strong> ${escapeHtml(item.label)}</span>
    </div>
  `).join('')
}

function renderInsights(title: string, items: string[]) {
  return `
    <section class="insight-card">
      <header class="insight-card-header">
        <h3>${escapeHtml(title)}</h3>
      </header>
      <ul class="insight-card-list">
        ${renderList(items)}
      </ul>
    </section>
  `
}

function renderHeaderMark() {
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5.5H20V18.5H4V5.5Z" stroke="currentColor" stroke-width="1.8" />
      <path d="M4.8 15.8L9.5 12.1L12.7 14.4L19.2 9.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `
}

function buildDonutGradient(analysis: CvAnalysisResult) {
  let offset = 0

  const segments = analysis.distribuicaoQualidade.map((item) => {
    const start = offset
    offset += item.value
    return `${item.color} ${start}% ${offset}%`
  })

  return `conic-gradient(${segments.join(', ')})`
}

function renderReportHtml(analysis: CvAnalysisResult, fileName: string, areaLabel: string, appVersion: string) {
  const donutGradient = buildDonutGradient(analysis)

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(normalizeFileName(fileName))}</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #2f2923;
        --muted-ink: #6a6258;
        --panel: #fffaf2;
        --chip: rgba(255, 255, 255, 0.54);
        --card: rgba(255, 255, 255, 0.5);
        --surface: #fffaf2;
      }

      * {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        padding: 0;
        background:
          radial-gradient(circle at top left, rgba(143, 171, 199, 0.24), transparent 30%),
          radial-gradient(circle at top right, rgba(221, 184, 112, 0.18), transparent 26%),
          linear-gradient(180deg, #f6f0e7 0%, #f9f5ef 100%);
        color: #241f1a;
        font-family: "Avenir Next", Avenir, "Segoe UI", sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        padding: 18px;
      }

      .page {
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
        border: 2px solid var(--ink);
        background: rgba(255, 252, 246, 0.82);
        box-shadow: 0 18px 60px rgba(51, 39, 26, 0.12);
      }

      .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 20px 28px;
        border-bottom: 2px solid var(--ink);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .brand-mark {
        display: inline-flex;
        width: 42px;
        height: 42px;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--ink);
        background: linear-gradient(135deg, #fff 0%, #d9e6f2 100%);
        color: #241f1a;
      }

      .brand-chip {
        border: 1px solid var(--ink);
        background: var(--chip);
        padding: 6px 14px;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .content {
        display: grid;
        gap: 18px;
        padding: 38px 28px 34px;
      }

      .meta-row {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }

      .meta-chip {
        border: 1px solid var(--ink);
        background: var(--chip);
        padding: 6px 14px;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .card {
        border: 2px solid var(--ink);
        background: var(--surface);
        padding: 24px;
      }

      .hero-grid {
        display: grid;
        grid-template-columns: 1.05fr 1.2fr 180px;
        gap: 28px;
        align-items: start;
      }

      .donut-layout {
        display: grid;
        grid-template-columns: minmax(200px, 260px) 1fr;
        gap: 24px;
        align-items: center;
      }

      .donut-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .donut-chart {
        width: 184px;
        height: 184px;
        border-radius: 50%;
        background: ${donutGradient};
        position: relative;
      }

      .donut-chart::after {
        content: "";
        position: absolute;
        inset: 28px;
        border-radius: 50%;
        background: var(--surface);
      }

      .legend-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 14px;
        font-size: 17px;
        line-height: 1.35;
      }

      .legend-dot {
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: 10px;
        border-radius: 999px;
        vertical-align: middle;
      }

      .summary-list {
        display: grid;
        gap: 10px;
        font-size: 16px;
        margin-top: 12px;
      }

      .summary-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .section-title {
        margin: 0 0 10px;
        font-size: 22px;
        font-weight: 500;
      }

      .section-axis {
        display: grid;
        grid-template-columns: auto 1fr 1fr auto;
        gap: 10px;
        color: var(--muted-ink);
        font-size: 14px;
      }

      .section-bars {
        display: grid;
        gap: 14px;
        margin-top: 16px;
      }

      .section-bar-row {
        display: grid;
        grid-template-columns: 160px 1fr auto;
        gap: 12px;
        align-items: center;
      }

      .section-bar-label,
      .section-bar-score {
        font-size: 17px;
      }

      .section-bar-track {
        height: 18px;
        border: 1px solid var(--ink);
        background-image: linear-gradient(
          90deg,
          rgba(47, 41, 35, 0.08) 0 33.33%,
          rgba(47, 41, 35, 0.03) 33.33% 66.66%,
          rgba(47, 41, 35, 0.08) 66.66% 100%
        );
      }

      .section-bar-fill {
        height: 100%;
        border-right: 2px solid rgba(36, 31, 26, 0.35);
      }

      .muted {
        color: var(--muted-ink);
      }

      .score-card {
        display: flex;
        width: 170px;
        height: 170px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--ink);
        border-radius: 999px;
        background: var(--card);
        text-align: center;
      }

      .score-card p {
        margin: 0 0 10px;
        font-size: 15px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted-ink);
      }

      .score-card strong {
        font-size: 56px;
        line-height: 1;
      }

      .score-card span {
        font-size: 22px;
      }

      .card-header {
        border-bottom: 2px solid var(--ink);
        padding-bottom: 12px;
      }

      .card-header h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 500;
      }

      .card-header p {
        margin: 10px 0 0;
        font-size: 14px;
      }

      .body-copy {
        margin: 16px 0 0;
        font-size: 16px;
        line-height: 1.55;
      }

      .insight-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .two-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .insight-card {
        min-height: 220px;
        border: 2px solid var(--ink);
        background: var(--surface);
      }

      .insight-card-header {
        border-bottom: 2px solid var(--ink);
        padding: 18px 22px;
      }

      .insight-card-header h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 500;
      }

      .insight-card-list,
      .basic-list {
        margin: 0;
        padding: 24px 30px 30px 36px;
        display: grid;
        gap: 18px;
        line-height: 1.45;
      }

      .dashed-box {
        margin-top: 16px;
        border: 1px dashed rgba(47, 41, 35, 0.2);
        padding: 16px;
      }

      .footer-note {
        font-size: 14px;
      }

      .page-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-top: 2px solid var(--ink);
        padding: 20px 28px;
        color: var(--muted-ink);
        font-size: 14px;
      }

      .page-footer-left {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .page-footer a {
        color: inherit;
        text-decoration: none;
      }

      .avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark">${renderHeaderMark()}</span>
          <span>CurriculoAI</span>
        </div>
        <div class="brand-chip">NUXT 4 + OPENAI</div>
      </header>

      <section class="content">
        <div class="meta-row">
          <span class="meta-chip">${escapeHtml(fileName || 'Resultado da analise')}</span>
          <span class="meta-chip">Area: ${escapeHtml(areaLabel || analysis.areaAlvo || 'Indefinido')}</span>
        </div>

        <article class="card avoid-break">
          <div class="hero-grid">
            <div>
              <div class="donut-layout">
                <div class="donut-wrap">
                  <div class="donut-chart"></div>
                </div>
                <ul class="legend-list">
                  ${renderDistributionLegend(analysis)}
                </ul>
              </div>
              <div class="summary-list">
                ${renderDistributionSummary(analysis)}
              </div>
            </div>

            <div>
              <h3 class="section-title">Avaliacao por Secao</h3>
              <div class="section-axis" aria-hidden="true">
                <span>1</span>
                <span>Menos eficiente</span>
                <span>Mediano</span>
                <span>Eficiente</span>
              </div>
              <div class="section-bars">
                ${renderSectionBars(analysis)}
              </div>
              <p class="muted" style="margin: 14px 0 0; font-size: 14px;">Senioridade estimada: <span style="text-transform: capitalize;">${escapeHtml(analysis.senioridadeEstimada)}</span></p>
            </div>

            <div style="display:flex; justify-content:center;">
              <div class="score-card">
                <p>Nota</p>
                <strong>${analysis.notaGeral}</strong>
                <span>/10</span>
              </div>
            </div>
          </div>
        </article>

        <article class="card avoid-break">
          <header class="card-header">
            <h3>Resumo profissional</h3>
            ${analysis.areaAlvo ? `<p class="muted">Avaliacao orientada para a area <strong>${escapeHtml(analysis.areaAlvo)}</strong>.</p>` : ''}
          </header>
          <p class="body-copy">${escapeHtml(analysis.resumoProfissional)}</p>
        </article>

        <section class="insight-grid">
          ${renderInsights('Pontos Fortes', analysis.pontosFortes)}
          ${renderInsights('Pontos Fracos', analysis.pontosFracos)}
          ${renderInsights('Sugestoes de Melhoria', analysis.sugestoesMelhoria)}
        </section>

        <section class="two-grid">
          <article class="card avoid-break">
            <header class="card-header">
              <h3>Melhoria no resumo</h3>
            </header>
            <div class="dashed-box">
              <p class="body-copy" style="margin-top:0;">${escapeHtml(analysis.resumoOtimizado)}</p>
            </div>
          </article>

          <article class="card avoid-break">
            <header class="card-header">
              <h3>Dicas para entrevista</h3>
            </header>
            <ul class="basic-list">
              ${renderList(analysis.dicasEntrevista)}
            </ul>
          </article>
        </section>

        <article class="card avoid-break">
          <header class="card-header">
            <h3>Habilidades identificadas</h3>
          </header>
          <ul class="basic-list">
            ${renderList(analysis.habilidadesIdentificadas)}
          </ul>
        </article>

        <article class="card avoid-break">
          <header class="card-header">
            <h3>Informacoes ausentes ou nao identificadas</h3>
          </header>
          <ul class="basic-list">
            ${renderList(analysis.observacoesAusentes)}
          </ul>
        </article>

        <article class="card avoid-break">
          <p class="footer-note muted">${escapeHtml(analysis.avisoAutomacao)}</p>
        </article>
      </section>

      <footer class="page-footer">
        <div class="page-footer-left">
          <a href="https://github.com/gabriel-vitebo/curriculoAi">GitHub</a>
          <span>|</span>
          <a href="https://github.com/gabriel-vitebo/curriculoAi/releases">Releases</a>
        </div>
        <span>${escapeHtml(appVersion)}</span>
      </footer>
    </main>
  </body>
</html>`
}

export default defineEventHandler(async (event) => {
  const {
    public: { appVersion },
  } = useRuntimeConfig(event)
  const body = await readBody<ReportRequestBody>(event)
  const analysis = body.analysis

  if (!analysis) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Analise nao enviada para gerar o PDF.',
    })
  }

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setContent(
      renderReportHtml(
        analysis,
        String(body.fileName || ''),
        String(body.areaLabel || analysis.areaAlvo || ''),
        String(appVersion || ''),
      ),
      { waitUntil: 'networkidle0' },
    )

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm',
      },
    })

    const fileName = normalizeFileName(String(body.fileName || ''))

    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', buildContentDisposition(fileName))
    setHeader(event, 'Cache-Control', 'no-store')

    return pdf
  } finally {
    await page.close()
  }
})
