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
      <IconsPdfFile />
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
