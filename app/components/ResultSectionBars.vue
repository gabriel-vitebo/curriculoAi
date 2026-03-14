<script setup lang="ts">
defineProps<{
  items: Array<{ label: string, score: number, color: string }>
}>()
</script>

<template>
  <div class="bars">
    <div class="bars__header">
      <h3>Avaliacao por Secao</h3>
      <div class="bars__scale" aria-hidden="true">
        <span>1</span>
        <span>Menos eficiente</span>
        <span>Mediano</span>
        <span>Eficiente</span>
      </div>
    </div>

    <div v-for="item in items" :key="item.label" class="bars__row">
      <span class="bars__label">{{ item.label }}</span>
      <div class="bars__track">
        <div class="bars__fill" :style="{ width: `${item.score * 10}%`, background: item.color }" />
      </div>
      <strong class="bars__score">{{ item.score }}</strong>
    </div>
  </div>
</template>

<style scoped>
.bars {
  display: grid;
  gap: 16px;
}

.bars__header h3 {
  margin: 0 0 10px;
  font-size: 1.5rem;
}

.bars__scale {
  display: grid;
  grid-template-columns: auto 1fr 1fr auto;
  gap: 10px;
  color: var(--muted);
  font-size: 0.92rem;
}

.bars__row {
  display: grid;
  grid-template-columns: 160px 1fr auto;
  gap: 12px;
  align-items: center;
}

.bars__track {
  position: relative;
  height: 18px;
  border: 1px solid var(--border);
  background:
    linear-gradient(
      90deg,
      rgba(47, 41, 35, 0.08) 0 33.33%,
      rgba(47, 41, 35, 0.03) 33.33% 66.66%,
      rgba(47, 41, 35, 0.08) 66.66% 100%
    );
}

.bars__fill {
  height: 100%;
  border-right: 2px solid rgba(36, 31, 26, 0.35);
}

.bars__label,
.bars__score {
  font-size: 1.05rem;
}

@media (max-width: 860px) {
  .bars__row {
    grid-template-columns: 1fr;
  }
}
</style>
