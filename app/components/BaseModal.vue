<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="fixed inset-0 z-30 grid place-items-center bg-[rgba(36,31,26,0.4)] p-5" role="presentation" @click="emit('close')">
    <div
      class="w-full max-w-[480px] border-2 border-[#2f2923] bg-[#fffaf2] p-7 text-center"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @click.stop
    >
      <p class="mb-2 text-2xl font-bold">{{ title }}</p>
      <p class="mb-6 text-[#6a6258]">{{ description }}</p>
      <button class="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#2f2923] bg-[#f0eadf] px-[18px] text-[#241f1a] transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-[#e5ddcf]" type="button" @click="emit('close')">
        OK
      </button>
    </div>
  </div>
</template>
