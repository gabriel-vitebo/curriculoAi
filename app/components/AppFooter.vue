<script setup lang="ts">
const version = 'Versao 1.0'
</script>

<template>
  <footer class="page-footer">
    <div class="footer-links">
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

<style scoped>
.footer-links {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}
</style>
