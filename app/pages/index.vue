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

function handleFileSelected(file: File) {
  navigateTo({
    path: '/resultado',
    query: {
      file: file.name,
    },
  })
}
</script>
