<template>
  <div class="grid gap-4">
    <div>
      <h3 class="mb-[10px] text-2xl">Avaliacao por Secao</h3>
      <div class="grid grid-cols-[auto_1fr_1fr_auto] gap-[10px] text-[0.92rem] text-[#6a6258]" aria-hidden="true">
        <span>1</span>
        <span>Menos eficiente</span>
        <span>Mediano</span>
        <span>Eficiente</span>
      </div>
    </div>

    <div v-for="item in items" :key="item.label" class="grid items-center gap-3 min-[861px]:grid-cols-[160px_1fr_auto]">
      <span class="text-[1.05rem]">{{ item.label }}</span>
      <div class="relative h-[18px] border border-[#2f2923] bg-[linear-gradient(90deg,rgba(47,41,35,0.08)_0_33.33%,rgba(47,41,35,0.03)_33.33%_66.66%,rgba(47,41,35,0.08)_66.66%_100%)]">
        <div class="h-full border-r-2 border-r-[rgba(36,31,26,0.35)]" :style="{ width: `${item.score * 10}%`, background: item.color }" ></div>
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
