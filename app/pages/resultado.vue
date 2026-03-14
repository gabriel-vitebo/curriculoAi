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
  <main class="mx-auto my-6 w-[min(1120px,calc(100%-32px))] border-2 border-[#2f2923] bg-[rgba(255,252,246,0.82)] shadow-[0_18px_60px_rgba(51,39,26,0.12)] backdrop-blur-[14px] max-md:my-2 max-md:w-[min(100%,calc(100%-16px))]">
    <AppHeader />

    <section class="grid gap-7 px-7 py-10 max-md:px-[18px]">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <NuxtLink to="/" class="text-[1.1rem] font-semibold">
          &lt; Importar outro curriculo
        </NuxtLink>
        <span class="inline-flex items-center gap-[10px] border border-[#2f2923] bg-[rgba(255,255,255,0.54)] px-[14px] py-[6px] text-[0.76rem] uppercase tracking-[0.14em]">{{ route.query.file || 'Resultado da analise' }}</span>
      </div>

      <section class="grid items-stretch gap-[18px] min-[1081px]:grid-cols-[1.05fr_1.2fr_220px]">
        <div class="border-2 border-[#2f2923] bg-[#fffaf2] p-6">
          <ResultDonutChart :sections="analysis.distribution" />
        </div>

        <div class="border-2 border-[#2f2923] bg-[#fffaf2] p-6">
          <ResultSectionBars :items="analysis.sectionScores" />
        </div>

        <aside class="grid aspect-square content-center justify-items-center rounded-full border-2 border-[#2f2923] bg-[#fffaf2] p-6 min-[1081px]:aspect-square max-[1080px]:min-h-[180px] max-[1080px]:rounded-[28px]">
          <span class="text-[1.7rem]">Nota</span>
          <strong class="text-[4rem] leading-none">{{ analysis.overallScore }}</strong>
          <small class="text-[1.5rem]">/10</small>
        </aside>
      </section>

      <section class="grid gap-[18px] min-[861px]:grid-cols-3">
        <InsightCard title="Pontos Fortes" :items="analysis.strengths" />
        <InsightCard title="Pontos Fracos" :items="analysis.weaknesses" />
        <InsightCard title="Sugestoes de Melhoria" :items="analysis.suggestions" />
      </section>

      <section class="grid gap-[18px] min-[861px]:grid-cols-2">
        <article class="border-2 border-[#2f2923] bg-[#fffaf2] p-6">
          <header class="border-b-2 border-[#2f2923] pb-4">
            <h3 class="m-0 text-[1.7rem]">Melhoria no Resumo</h3>
          </header>
          <div class="mt-[22px] border border-dashed border-[rgba(47,41,35,0.2)] bg-[rgba(255,255,255,0.54)] p-[22px]">
            {{ analysis.rewrittenSummary }}
          </div>
        </article>

        <article class="border-2 border-[#2f2923] bg-[#fffaf2] p-6">
          <header class="border-b-2 border-[#2f2923] pb-4">
            <h3 class="m-0 text-[1.7rem]">Dicas para Entrevista</h3>
          </header>
          <ul class="m-0 grid gap-[14px] pl-[22px] pt-[22px]">
            <li v-for="tip in analysis.interviewTips" :key="tip">
              {{ tip }}
            </li>
          </ul>
        </article>
      </section>

      <div class="flex flex-wrap justify-center gap-4">
        <button class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#2f2923] bg-[#f0eadf] px-[18px] text-[#241f1a] transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-[#e5ddcf]" type="button">Baixar relatorio</button>
        <button class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#2f2923] bg-[#dfead2] px-[18px] text-[#241f1a] transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-[#d2e2bf]" type="button">Salvar novo PDF</button>
      </div>
    </section>

    <AppFooter />
  </main>
</template>
