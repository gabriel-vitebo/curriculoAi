<template>
  <footer class="flex items-center justify-between gap-4 border-t-2 border-[#2f2923] px-7 py-5 text-[#6a6258] max-md:flex-col max-md:items-start max-md:px-[18px]">
    <div class="inline-flex items-center gap-3">
      <a href="https://github.com/gabriel-vitebo/curriculoAi" target="_blank" rel="noreferrer">
        GitHub
      </a>
      <span>|</span>
      <a href="https://github.com/gabriel-vitebo/curriculoAi/releases" target="_blank" rel="noreferrer">
        Releases
      </a>
    </div>

    <span>{{ version }}</span>
  </footer>
</template>

<script setup lang="ts">
const version = 'Versao 1.0'
</script>
