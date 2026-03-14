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

<template>
  <main class="page-shell">
    <AppHeader />

    <section class="page-content home">
      <div class="home__hero">
        <span class="eyebrow">Pagina inicial</span>
        <h1 class="section-heading">Melhore seu curriculo com Inteligencia Artificial.</h1>
        <p class="section-lead">
          Envie seu curriculo em PDF para receber analises, sugestoes e uma estrutura pronta
          para a proxima etapa com OpenAI.
        </p>
      </div>

      <UploadDropzone
        @file-selected="handleFileSelected"
        @invalid-file="showInvalidFileModal = true"
      />

      <section class="roadmap card">
        <div>
          <p class="roadmap__step">Etapa 1</p>
          <strong>Upload do PDF</strong>
          <p>Validar arquivo, tamanho e tipo.</p>
        </div>
        <div>
          <p class="roadmap__step">Etapa 2</p>
          <strong>Extracao de texto</strong>
          <p>Converter o conteudo do PDF para texto bruto.</p>
        </div>
        <div>
          <p class="roadmap__step">Etapa 3</p>
          <strong>Analise com OpenAI</strong>
          <p>Gerar nota, feedbacks e sugestoes estruturadas.</p>
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

<style scoped>
.home {
  display: grid;
  gap: 32px;
}

.home__hero {
  display: grid;
  justify-items: center;
  gap: 14px;
  text-align: center;
  padding-top: 18px;
}

.roadmap {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  padding: 24px;
}

.roadmap > div {
  padding: 22px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.5);
}

.roadmap p {
  margin: 8px 0 0;
  color: var(--muted);
}

.roadmap__step {
  margin: 0 0 8px;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
}

@media (max-width: 860px) {
  .roadmap {
    grid-template-columns: 1fr;
  }
}
</style>
