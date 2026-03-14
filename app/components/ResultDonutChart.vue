<script setup lang="ts">
const props = defineProps<{
  sections: Array<{ label: string, value: number, color: string }>
}>()

const radius = 74
const circumference = 2 * Math.PI * radius

const segments = computed(() => {
  let offset = 0

  return props.sections.map((section) => {
    const dash = `${(section.value / 100) * circumference} ${circumference}`
    const currentOffset = offset
    offset += (section.value / 100) * circumference

    return {
      ...section,
      dash,
      offset: -currentOffset,
    }
  })
})
</script>

<template>
  <div class="donut">
    <svg viewBox="0 0 200 200" class="donut__chart" aria-label="Distribuicao da avaliacao">
      <circle cx="100" cy="100" :r="radius" class="donut__track" />
      <circle
        v-for="segment in segments"
        :key="segment.label"
        cx="100"
        cy="100"
        :r="radius"
        class="donut__segment"
        :style="{
          stroke: segment.color,
          strokeDasharray: segment.dash,
          strokeDashoffset: segment.offset,
        }"
      />
      <circle cx="100" cy="100" r="46" class="donut__center" />
    </svg>

    <ul class="donut__legend">
      <li v-for="segment in sections" :key="segment.label">
        <span class="donut__dot" :style="{ background: segment.color }" />
        <strong>{{ segment.value }}%</strong> {{ segment.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut {
  display: grid;
  grid-template-columns: minmax(200px, 260px) 1fr;
  gap: 24px;
  align-items: center;
}

.donut__chart {
  width: 100%;
  max-width: 240px;
  transform: rotate(-90deg);
}

.donut__track,
.donut__segment {
  fill: none;
  stroke-width: 26;
}

.donut__track {
  stroke: rgba(47, 41, 35, 0.1);
}

.donut__center {
  fill: #fffaf2;
}

.donut__legend {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
  font-size: 1.15rem;
}

.donut__dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  margin-right: 10px;
}

@media (max-width: 860px) {
  .donut {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
