<template>
  <main class="mx-auto my-6 w-[min(1120px,calc(100%-32px))] border-2 border-ink bg-panel shadow-panel backdrop-blur-[14px] max-md:my-2 max-md:w-[min(100%,calc(100%-16px))]">
    <AppHeader />

    <section class="grid gap-7 px-7 py-10 max-md:px-[18px]">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <NuxtLink to="/" class="text-[1.1rem] font-semibold">
          &lt; Importar outro curriculo
        </NuxtLink>
        <span class="inline-flex items-center gap-[10px] border border-ink bg-chip px-[14px] py-[6px] text-[0.76rem] uppercase tracking-[0.14em]">{{ route.query.file || 'Resultado da analise' }}</span>
      </div>

      <section v-if="isLoading" class="border-2 border-ink bg-surface p-6">
        <p class="text-lg font-semibold">Analisando curriculo...</p>
        <p class="mt-2 text-muted-ink">Estamos validando o PDF e gerando seu relatorio com IA.</p>
      </section>

      <section v-else-if="errorMessage" class="border-2 border-ink bg-surface p-6">
        <p class="text-lg font-semibold text-red-700">Nao foi possivel concluir a analise</p>
        <p class="mt-2">{{ errorMessage }}</p>
        <NuxtLink to="/" class="mt-4 inline-flex border border-ink bg-chip px-4 py-2 text-sm uppercase tracking-[0.08em]">
          Tentar novamente
        </NuxtLink>
      </section>

      <template v-else-if="analysis">
        <section class="grid items-stretch gap-[18px] min-[861px]:grid-cols-2">
          <article class="border-2 border-ink bg-surface p-6">
            <p class="mb-2 text-[0.82rem] uppercase tracking-[0.12em] text-muted-ink">Nota geral</p>
            <strong class="text-[4rem] leading-none">{{ analysis.notaGeral }}</strong>
            <small class="ml-1 text-[1.5rem]">/10</small>
          </article>

          <article class="border-2 border-ink bg-surface p-6">
            <p class="mb-2 text-[0.82rem] uppercase tracking-[0.12em] text-muted-ink">Senioridade estimada</p>
            <strong class="text-[2rem] leading-none capitalize">{{ analysis.senioridadeEstimada }}</strong>
            <p class="mt-3 text-muted-ink">Estimativa baseada apenas no conteudo informado no curriculo.</p>
          </article>
        </section>

        <section class="grid gap-[18px]">
          <article class="border-2 border-ink bg-surface p-6">
            <header class="border-b-2 border-ink pb-3">
              <h3 class="m-0 text-[1.5rem]">Resumo profissional</h3>
            </header>
            <p class="mt-4">{{ analysis.resumoProfissional }}</p>
          </article>

          <section class="grid gap-[18px] min-[861px]:grid-cols-3">
            <InsightCard title="Pontos Fortes" :items="analysis.pontosFortes" />
            <InsightCard title="Pontos Fracos" :items="analysis.pontosFracos" />
            <InsightCard title="Sugestoes de Melhoria" :items="analysis.sugestoesMelhoria" />
          </section>

          <article class="border-2 border-ink bg-surface p-6">
            <header class="border-b-2 border-ink pb-3">
              <h3 class="m-0 text-[1.5rem]">Habilidades identificadas</h3>
            </header>
            <ul class="m-0 mt-4 grid gap-2 pl-5">
              <li v-for="item in analysis.habilidadesIdentificadas" :key="item">{{ item }}</li>
            </ul>
          </article>

          <article class="border-2 border-ink bg-surface p-6">
            <header class="border-b-2 border-ink pb-3">
              <h3 class="m-0 text-[1.5rem]">Informacoes ausentes ou nao identificadas</h3>
            </header>
            <ul class="m-0 mt-4 grid gap-2 pl-5">
              <li v-for="item in analysis.observacoesAusentes" :key="item">{{ item }}</li>
            </ul>
          </article>

          <article class="border-2 border-ink bg-surface p-6">
            <p class="text-sm text-muted-ink">{{ analysis.avisoAutomacao }}</p>
          </article>
        </section>

        <div class="flex flex-wrap justify-center gap-4">
          <button
            class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-button-neutral bg-button-neutral-hover px-[18px] text-ink transition-[transform,background-color] duration-150 hover:-translate-y-px"
            type="button"
            @click="copyReport"
          >
            {{ copyButtonLabel }}
          </button>
          <button
            class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-button-positive bg-button-positive-hover px-[18px] text-ink transition-[transform,background-color] duration-150 hover:-translate-y-px"
            type="button"
            @click="downloadReport"
          >
            Baixar relatorio
          </button>
        </div>
      </template>
    </section>

    <AppFooter />
  </main>
</template>

<script setup lang="ts">
import type { CvAnalysisResult } from '~/types/cv-analysis'

const route = useRoute()
const selectedCvFile = useSelectedCvFile()
const cvAnalysisResult = useCvAnalysisResult()

const analysis = computed(() => cvAnalysisResult.value)
const isLoading = ref(false)
const errorMessage = ref('')
const copyButtonLabel = ref('Copiar relatorio')

const FALLBACK_ERROR_MESSAGE = 'Nao foi possivel analisar o curriculo neste momento. Tente novamente mais tarde.'

onMounted(async () => {
  if (analysis.value) {
    return
  }

  const file = selectedCvFile.value

  if (!file) {
    errorMessage.value = 'Nenhum arquivo foi encontrado para analise. Envie o curriculo novamente.'
    return
  }

  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file, file.name)

    const response = await $fetch<{ analysis: CvAnalysisResult, cached: boolean }>('/api/cv/analyze', {
      method: 'POST',
      body: formData,
    })

    cvAnalysisResult.value = response.analysis
  } catch (error: unknown) {
    errorMessage.value = getFriendlyMessage(error)
  } finally {
    isLoading.value = false
  }
})

function getFriendlyMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string } }).data

    if (data?.statusMessage) {
      return data.statusMessage
    }
  }

  return FALLBACK_ERROR_MESSAGE
}

function buildReportText() {
  if (!analysis.value) {
    return ''
  }

  const lines = [
    `Nota geral: ${analysis.value.notaGeral}/10`,
    `Senioridade estimada: ${analysis.value.senioridadeEstimada}`,
    '',
    'Resumo profissional:',
    analysis.value.resumoProfissional,
    '',
    'Pontos fortes:',
    ...analysis.value.pontosFortes.map((item) => `- ${item}`),
    '',
    'Pontos fracos:',
    ...analysis.value.pontosFracos.map((item) => `- ${item}`),
    '',
    'Habilidades identificadas:',
    ...analysis.value.habilidadesIdentificadas.map((item) => `- ${item}`),
    '',
    'Sugestoes de melhoria:',
    ...analysis.value.sugestoesMelhoria.map((item) => `- ${item}`),
    '',
    'Informacoes ausentes ou nao identificadas:',
    ...analysis.value.observacoesAusentes.map((item) => `- ${item}`),
    '',
    analysis.value.avisoAutomacao,
  ]

  return lines.join('\n')
}

async function copyReport() {
  const report = buildReportText()

  if (!report) {
    return
  }

  try {
    await navigator.clipboard.writeText(report)
    copyButtonLabel.value = 'Copiado!'
    setTimeout(() => {
      copyButtonLabel.value = 'Copiar relatorio'
    }, 1800)
  } catch {
    copyButtonLabel.value = 'Falha ao copiar'
  }
}

function downloadReport() {
  const report = buildReportText()

  if (!report) {
    return
  }

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'curriculo-ai-relatorio.txt'
  link.click()

  URL.revokeObjectURL(url)
}
</script>
