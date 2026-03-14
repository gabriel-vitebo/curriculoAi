<script setup lang="ts">
defineProps<{
  title: string
  items: string[]
}>()
</script>

<template>
  <section class="insight card">
    <header class="insight__header">
      <h3>{{ title }}</h3>
    </header>

    <ul class="insight__list">
      <li v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.insight {
  min-height: 220px;
}

.insight__header {
  padding: 18px 22px;
  border-bottom: 2px solid var(--border);
}

.insight__header h3 {
  margin: 0;
  font-size: 1.6rem;
}

.insight__list {
  margin: 0;
  padding: 24px 30px 30px;
  display: grid;
  gap: 18px;
}
</style>
