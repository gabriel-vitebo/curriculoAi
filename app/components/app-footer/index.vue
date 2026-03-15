<template>
  <footer class="flex items-center justify-between gap-4 border-t-2 border-ink px-7 py-5 text-muted-ink max-md:flex-col max-md:items-start max-md:px-[18px]">
    <div class="inline-flex items-center gap-3">
      <a href="https://github.com/gabriel-vitebo/curriculoAi" target="_blank" rel="noreferrer">
        GitHub
      </a>
      <span>|</span>
      <a href="https://github.com/gabriel-vitebo/curriculoAi/releases" target="_blank" rel="noreferrer">
        Releases
      </a>
    </div>

    <span>{{ appVersion }}</span>
  </footer>
</template>

<script setup lang="ts">
const { public: { appVersion } } = useRuntimeConfig()
</script>
