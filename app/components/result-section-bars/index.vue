<template>
  <div class="grid gap-4">
    <div>
      <h3 class="mb-[10px] text-2xl">Avaliacao por Secao</h3>
      <div class="grid grid-cols-[auto_1fr_1fr_auto] gap-[10px] text-[0.92rem] text-muted-ink" aria-hidden="true">
        <span>1</span>
        <span>Menos eficiente</span>
        <span>Mediano</span>
        <span>Eficiente</span>
      </div>
    </div>

    <div v-for="item in items" :key="item.label" class="grid items-center gap-3 min-[861px]:grid-cols-[160px_1fr_auto]">
      <span class="text-[1.05rem]">{{ item.label }}</span>
      <div class="relative h-[18px] border border-ink bg-bars-track">
        <div class="h-full border-r-2 border-progress-ink" :style="{ width: `${item.score * 10}%`, background: item.color }" ></div>
      </div>
      <strong class="text-[1.05rem]">{{ item.score }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ label: string, score: number, color: string }>
}>()
</script>
