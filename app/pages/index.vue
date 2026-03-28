<template>
  <main class="mx-auto w-[min(1120px,calc(100%-32px))] border-2 border-ink bg-panel shadow-panel backdrop-blur-[14px] max-md:my-2 max-md:w-[min(100%,calc(100%-16px))]">
    <AppHeader />

    <section class="grid gap-8 px-7 py-10 max-md:px-[18px]">
      <div class="grid justify-items-center gap-[14px] pt-[18px] text-center">
        <span class="inline-flex items-center gap-[10px] border border-ink bg-chip px-[14px] py-[6px] text-[0.76rem] uppercase tracking-[0.14em]">Pagina inicial</span>
        <h1 class="mb-3 text-center text-[clamp(2.1rem,4vw,3.4rem)]">Melhore seu curriculo com Inteligencia Artificial.</h1>
        <p class="mx-auto max-w-[820px] text-center">
          Envie seu curriculo em PDF para receber analises, sugestoes e uma estrutura pronta
          para a proxima etapa com OpenAI.
        </p>
      </div>

      <section class="grid gap-5 border-2 border-ink bg-surface p-6">
        <UploadDropzone
          @file-selected="handleFileSelected"
          @invalid-file="handleInvalidFile"
          @invalid-size="handleInvalidSize"
        />

        <div class="grid gap-5 border border-subtle-ink bg-card p-5">
          <div class="grid gap-2">
            <label class="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-muted-ink" for="desired-area">
              Area desejada
            </label>
            <input
              id="desired-area"
              v-model.trim="selectedCvArea"
              class="min-h-12 border border-ink bg-surface px-4 text-[1rem] text-ink outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(142,172,200,0.28)]"
              type="text"
              maxlength="120"
              placeholder="Ex.: Programacao front-end"
            />
            <p class="text-sm text-muted-ink">
              A nota vai considerar o quanto seu curriculo combina com essa area, nao apenas a qualidade geral do texto.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-subtle-ink pt-4">
            <p class="text-sm text-muted-ink">
              {{ selectedCvFile ? `Arquivo selecionado: ${selectedCvFile.name}` : 'Nenhum PDF selecionado ainda.' }}
            </p>
            <button
              class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink bg-button-positive bg-button-positive-hover px-[18px] text-ink transition-[transform,background-color,opacity] duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              :disabled="!selectedCvFile || isSubmitting"
              @click="goToAnalysis"
            >
              {{ isSubmitting ? 'Preparando analise...' : 'Enviar para analise' }}
            </button>
          </div>
        </div>
      </section>

      <section class="grid gap-5 border-2 border-ink bg-surface p-6 min-[861px]:grid-cols-3">
        <div class="border border-subtle-ink bg-card p-[22px]">
          <p class="mb-2 text-[0.82rem] uppercase tracking-[0.12em] text-muted-ink">Etapa 1</p>
          <strong>Upload do PDF</strong>
          <p class="mt-2 text-muted-ink">Validar arquivo, tamanho e tipo.</p>
        </div>
        <div class="border border-subtle-ink bg-card p-[22px]">
          <p class="mb-2 text-[0.82rem] uppercase tracking-[0.12em] text-muted-ink">Etapa 2</p>
          <strong>Extracao de texto</strong>
          <p class="mt-2 text-muted-ink">Converter o conteudo do PDF para texto bruto.</p>
        </div>
        <div class="border border-subtle-ink bg-card p-[22px]">
          <p class="mb-2 text-[0.82rem] uppercase tracking-[0.12em] text-muted-ink">Etapa 3</p>
          <strong>Analise com OpenAI</strong>
          <p class="mt-2 text-muted-ink">Gerar nota, feedbacks e sugestoes estruturadas.</p>
        </div>
      </section>
    </section>

    <AppFooter />

    <BaseModal
      v-if="showInvalidFileModal"
      title="Arquivo invalido"
      :description="fileErrorMessage"
      @close="showInvalidFileModal = false"
    />
  </main>
</template>

<script setup lang="ts">
const showInvalidFileModal = ref(false)
const fileErrorMessage = ref('Formato invalido. Envie um curriculo em PDF.')
const selectedCvFile = useSelectedCvFile()
const selectedCvArea = useSelectedCvArea()
const cvAnalysisResult = useCvAnalysisResult()
const isSubmitting = ref(false)

function handleFileSelected(file: File) {
  selectedCvFile.value = file
  cvAnalysisResult.value = null
}

async function goToAnalysis() {
  if (!selectedCvFile.value) {
    handleInvalidFile()
    return
  }

  cvAnalysisResult.value = null
  isSubmitting.value = true

  await navigateTo({
    path: '/resultado',
    query: {
      file: selectedCvFile.value.name,
      area: selectedCvArea.value || undefined,
    },
  })

  isSubmitting.value = false
}

function handleInvalidSize(limitMB: number) {
  fileErrorMessage.value = `Arquivo muito grande. Envie um PDF de ate ${limitMB} MB.`
  showInvalidFileModal.value = true
}

function handleInvalidFile() {
  fileErrorMessage.value = 'Formato invalido. Envie um curriculo em PDF.'
  showInvalidFileModal.value = true
}
</script>
