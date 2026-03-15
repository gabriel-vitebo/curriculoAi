<template>
  <div
    class="grid cursor-pointer justify-items-center gap-5 rounded-[28px] border-2 border-dashed border-ink bg-surface px-6 py-10 transition-[transform,border-color,background-color] duration-180 ease-[ease] hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft"
    :class="isDragging ? '-translate-y-0.5 border-accent bg-accent-soft' : ''"
    role="button"
    tabindex="0"
    @click="selectFile"
    @keydown.enter.prevent="selectFile"
    @keydown.space.prevent="selectFile"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="fileInput"
      class="sr-only"
      type="file"
      accept="application/pdf"
      @change="onChange"
    />

    <div class="dropzone__icon" aria-hidden="true">
      <svg width="72" height="88" viewBox="0 0 72 88" fill="none">
        <path d="M14 2h30l14 14v68a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#fff" stroke="currentColor" stroke-width="2" />
        <path d="M44 2v14h14" stroke="currentColor" stroke-width="2" />
        <path d="M10 40h52v24H10z" fill="#dfead2" stroke="currentColor" stroke-width="2" />
        <path d="M20 57h8.4c5.5 0 8.3-3.2 8.3-8.2s-2.8-8.2-8.3-8.2H20V57Zm5.4-4.4v-7.9h2.7c2.1 0 3.2 1.5 3.2 4s-1.1 4-3.2 4h-2.7Zm14.5 4.4V40.6h7.5c5.1 0 7.8 2.6 7.8 8.2S52.5 57 47.4 57h-7.5Zm5.4-4.4h1.5c2.1 0 3-1.4 3-3.8s-.9-3.8-3-3.8h-1.5v7.6Zm12.4 4.4V40.6h12.4v4.2h-7v2.2H69v4.1h-5.9V57h-5.4Z" fill="currentColor" />
      </svg>
    </div>

    <div class="text-center">
      <p class="mb-2 text-2xl font-bold">Arraste ou selecione seu arquivo PDF.</p>
      <p class="m-0 text-muted-ink">
        Na proxima etapa vamos extrair o texto do curriculo e enviar para analise.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const isDragging = ref(false)

const emit = defineEmits<{
  fileSelected: [file: File]
  invalidFile: []
}>()

function selectFile() {
  fileInput.value?.click()
}

function handleFile(file?: File | null) {
  if (!file || file.type !== 'application/pdf') {
    emit('invalidFile')
    return
  }

  emit('fileSelected', file)
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  handleFile(target.files?.[0] ?? null)
  target.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  handleFile(event.dataTransfer?.files?.[0] ?? null)
}
</script>
