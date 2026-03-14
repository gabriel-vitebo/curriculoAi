<script setup lang="ts">
import type { AnalysisSummary } from '~/types/cv-analysis'

const route = useRoute()

const analysis = computed<AnalysisSummary>(() => ({
  overallScore: 7.5,
  distribution: [
    { label: 'Bem estruturado', value: 45, color: '#b7cfa7' },
    { label: 'Aceitavel', value: 35, color: '#9bbad6' },
    { label: 'Precisa de revisao', value: 20, color: '#e5c487' },
  ],
  sectionScores: [
    { label: 'Profissional', score: 7, color: '#9bbad6' },
    { label: 'Experiencias', score: 7, color: '#9bbad6' },
    { label: 'Competencias', score: 9, color: '#7ea2c4' },
    { label: 'Formacao', score: 7, color: '#9bbad6' },
    { label: 'Clareza escrita', score: 8, color: '#b2b2b2' },
  ],
  strengths: [
    'Estrutura de secoes facil de escanear.',
    'Competencias tecnicas aparecem com clareza.',
    'Experiencias com impacto razoavelmente visivel.',
  ],
  weaknesses: [
    'Resumo profissional pouco especifico.',
    'Resultados numericos ainda aparecem pouco.',
    'Alguns blocos podem ficar mais objetivos.',
  ],
  suggestions: [
    'Reescrever o resumo com foco no seu diferencial.',
    'Adicionar metricas nas experiencias mais fortes.',
    'Priorizar competencias aderentes a vaga alvo.',
  ],
  rewrittenSummary:
    'Profissional com experiencia em ambientes digitais, atuando com foco em execucao, organizacao e entrega de resultados. Perfil orientado a melhoria continua, comunicacao clara e desenvolvimento de processos mais eficientes.',
  interviewTips: [
    'Prepare um exemplo concreto de impacto em projetos anteriores.',
    'Treine respostas que conectem suas experiencias com a vaga desejada.',
  ],
}))
</script>

<template>
  <main class="page-shell">
    <AppHeader />

    <section class="page-content results">
      <div class="results__topbar">
        <NuxtLink to="/" class="results__back">
          &lt; Importar outro curriculo
        </NuxtLink>
        <span class="eyebrow">{{ route.query.file || 'Resultado da analise' }}</span>
      </div>

      <section class="results__overview">
        <div class="card results__chart">
          <ResultDonutChart :sections="analysis.distribution" />
        </div>

        <div class="card results__bars">
          <ResultSectionBars :items="analysis.sectionScores" />
        </div>

        <aside class="card score-card">
          <span>Nota</span>
          <strong>{{ analysis.overallScore }}</strong>
          <small>/10</small>
        </aside>
      </section>

      <section class="results__insights">
        <InsightCard title="Pontos Fortes" :items="analysis.strengths" />
        <InsightCard title="Pontos Fracos" :items="analysis.weaknesses" />
        <InsightCard title="Sugestoes de Melhoria" :items="analysis.suggestions" />
      </section>

      <section class="results__details">
        <article class="card detail-card">
          <header class="detail-card__header">
            <h3>Melhoria no Resumo</h3>
          </header>
          <div class="detail-card__body detail-card__body--highlight">
            {{ analysis.rewrittenSummary }}
          </div>
        </article>

        <article class="card detail-card">
          <header class="detail-card__header">
            <h3>Dicas para Entrevista</h3>
          </header>
          <ul class="detail-card__list">
            <li v-for="tip in analysis.interviewTips" :key="tip">
              {{ tip }}
            </li>
          </ul>
        </article>
      </section>

      <div class="results__actions">
        <button class="button" type="button">Baixar relatorio</button>
        <button class="button button--primary" type="button">Salvar novo PDF</button>
      </div>
    </section>

    <AppFooter />
  </main>
</template>

<style scoped>
.results {
  display: grid;
  gap: 28px;
}

.results__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.results__back {
  font-size: 1.1rem;
  font-weight: 600;
}

.results__overview {
  display: grid;
  grid-template-columns: 1.05fr 1.2fr 220px;
  gap: 18px;
  align-items: stretch;
}

.results__chart,
.results__bars,
.score-card,
.detail-card {
  padding: 24px;
}

.score-card {
  display: grid;
  align-content: center;
  justify-items: center;
  border-radius: 999px;
  aspect-ratio: 1;
}

.score-card span {
  font-size: 1.7rem;
}

.score-card strong {
  font-size: 4rem;
  line-height: 1;
}

.score-card small {
  font-size: 1.5rem;
}

.results__insights,
.results__details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.results__details {
  grid-template-columns: 1fr 1fr;
}

.detail-card__header {
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border);
}

.detail-card__header h3 {
  margin: 0;
  font-size: 1.7rem;
}

.detail-card__body,
.detail-card__list {
  margin: 0;
  padding: 22px 0 0;
}

.detail-card__body--highlight {
  padding: 22px;
  margin-top: 22px;
  border: 1px dashed var(--border-soft);
  background: rgba(255, 255, 255, 0.54);
}

.detail-card__list {
  display: grid;
  gap: 14px;
  padding-left: 22px;
}

.results__actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 1080px) {
  .results__overview {
    grid-template-columns: 1fr;
  }

  .score-card {
    border-radius: 28px;
    aspect-ratio: auto;
    min-height: 180px;
  }
}

@media (max-width: 860px) {
  .results__insights,
  .results__details {
    grid-template-columns: 1fr;
  }
}
</style>
