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
  <div class="modal-backdrop" role="presentation" @click="emit('close')">
    <div
      class="modal card"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @click.stop
    >
      <p class="modal__title">{{ title }}</p>
      <p class="modal__description">{{ description }}</p>
      <button class="button" type="button" @click="emit('close')">
        OK
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(36, 31, 26, 0.4);
  z-index: 30;
}

.modal {
  width: min(480px, 100%);
  padding: 28px;
  text-align: center;
}

.modal__title {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal__description {
  margin: 0 0 24px;
  color: var(--muted);
}
</style>
