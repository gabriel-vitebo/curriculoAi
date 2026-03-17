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

      <UploadDropzone
        @file-selected="handleFileSelected"
        @invalid-file="showInvalidFileModal = true"
      />

      <section class="grid gap-4 border-2 border-ink bg-surface p-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-xl">Teste da API (Nuxt server/api + OpenAI)</h2>
          <p class="text-sm text-muted-ink">
            Server health:
            <span v-if="health?.ok" class="font-semibold text-green-700">online</span>
            <span v-else class="font-semibold text-red-700">offline</span>
          </p>
        </div>

        <label class="grid gap-2">
          <span class="text-sm uppercase tracking-[0.12em] text-muted-ink">Prompt</span>
          <textarea
            v-model="prompt"
            class="min-h-28 border border-subtle-ink bg-card p-3 outline-none focus:border-ink"
            placeholder="Escreva um prompt para testar a rota /api/openai/analyze"
          ></textarea>
        </label>

        <div class="flex flex-wrap items-center gap-3">
          <button
            class="border border-ink bg-chip px-4 py-2 text-sm uppercase tracking-[0.08em] disabled:opacity-50"
            :disabled="isLoadingOpenAI"
            @click="onAnalyze"
          >
            {{ isLoadingOpenAI ? 'Consultando...' : 'Testar OpenAI' }}
          </button>
          <p v-if="openAIError" class="text-sm text-red-700">{{ openAIError }}</p>
        </div>

        <pre
          v-if="openAIOutput"
          class="whitespace-pre-wrap border border-subtle-ink bg-card p-4 text-sm"
        >{{ openAIOutput }}</pre>
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
      description="Por favor, envie um arquivo PDF."
      @close="showInvalidFileModal = false"
    />
  </main>
</template>

<script setup lang="ts">
const showInvalidFileModal = ref(false)
const prompt = ref('Resuma em 3 bullets como melhorar um curriculo de desenvolvedor front-end.')
const isLoadingOpenAI = ref(false)
const openAIOutput = ref('')
const openAIError = ref('')

const { data: health } = await useFetch<{ ok: boolean; timestamp: string }>('/api/health')

function handleFileSelected(file: File) {
  navigateTo({
    path: '/resultado',
    query: {
      file: file.name,
    },
  })
}

async function onAnalyze() {
  if (!prompt.value.trim()) {
    openAIError.value = 'Digite um prompt antes de testar.'
    return
  }

  isLoadingOpenAI.value = true
  openAIError.value = ''
  openAIOutput.value = ''

  try {
    const response = await $fetch<{ outputText: string }>('/api/openai/analyze', {
      method: 'POST',
      body: {
        input: prompt.value,
      },
    })

    openAIOutput.value = response.outputText || '[Sem texto de resposta]'
  } catch (error: unknown) {
    openAIError.value = error instanceof Error ? error.message : 'Falha ao chamar a API.'
  } finally {
    isLoadingOpenAI.value = false
  }
}
</script>
