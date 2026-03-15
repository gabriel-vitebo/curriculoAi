<template>
  <div class="grid items-center gap-6 min-[861px]:grid-cols-[minmax(200px,260px)_1fr] min-[861px]:justify-items-stretch max-[860px]:justify-items-center">
    <IconsDonutChart :radius="radius" :segments="segments" />

    <ul class="m-0 grid list-none gap-[14px] p-0 text-[1.15rem]">
      <li v-for="segment in sections" :key="segment.label">
        <span class="mr-[10px] inline-block h-[14px] w-[14px] rounded-full" :style="{ background: segment.color }" ></span>
        <strong>{{ segment.value }}%</strong> {{ segment.label }}
      </li>
    </ul>
  </div>
</template>

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
