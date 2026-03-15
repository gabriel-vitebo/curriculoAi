<template>
  <svg viewBox="0 0 200 200" class="w-full max-w-[240px] -rotate-90" aria-label="Distribuicao da avaliacao">
    <circle cx="100" cy="100" :r="radius" fill="none" stroke="rgba(47, 41, 35, 0.1)" stroke-width="26" />
    <circle
      v-for="segment in segments"
      :key="segment.label"
      cx="100"
      cy="100"
      :r="radius"
      fill="none"
      stroke-width="26"
      :style="{
        stroke: segment.color,
        strokeDasharray: segment.dash,
        strokeDashoffset: segment.offset,
      }"
    />
    <circle cx="100" cy="100" r="46" fill="#fffaf2" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  radius: number
  segments: Array<{
    label: string
    color: string
    dash: string
    offset: number
  }>
}>()
</script>
