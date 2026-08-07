<template>
  <button
    class="save-task-button"
    :class="{ 'save-task-button--saved': isSaved }"
    type="button"
    :disabled="isPending"
    :title="
      isSaved
        ? 'Убрать задание из сохранённых'
        : 'Сохранить задание, чтобы вернуться к нему позже'
    "
    @click="savedTaskStore.toggle(taskId, assignedWorkId)"
  >
    <noo-loader-icon
      v-if="isPending"
      class="save-task-button__icon"
    />
    <noo-icon
      v-else
      class="save-task-button__icon"
      name="star"
    />
    <span class="save-task-button__label">
      {{ isSaved ? 'В сохранённых' : 'Сохранить задание' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSavedTaskStore } from '../stores/saved-task.store'

interface Props {
  taskId: string
  assignedWorkId: string
}

const props = defineProps<Props>()

const savedTaskStore = useSavedTaskStore()

const isSaved = computed(() => savedTaskStore.isSaved(props.taskId))
const isPending = computed(() => savedTaskStore.isPending(props.taskId))

// Only one task of a work is on screen at a time, and the store keeps the work
// it already read, so this settles into one request per work.
onMounted(() => savedTaskStore.ensureLoaded(props.assignedWorkId))
</script>

<style scoped lang="sass">
.save-task-button
  display: inline-flex
  align-items: center
  gap: 0.4em
  font-family: inherit
  font-size: 0.75em
  font-weight: 700
  white-space: nowrap
  cursor: pointer
  padding: 0.3em 0.7em
  border-radius: var(--border-radius-button)
  border: 1px solid var(--border-color)
  background-color: transparent
  color: var(--text-light)
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease

  &:hover:not(:disabled)
    border-color: var(--form-text-color)
    color: var(--form-text-color)

  &:disabled
    cursor: progress
    opacity: 0.7

  &__icon
    // The star svg paints itself with --form-text-color, so the button's own
    // colour is what tips it from outline to filled-in.
    --form-text-color: currentColor
    font-size: 1.1em
    flex-shrink: 0

  &--saved
    background-color: var(--primary)
    border-color: var(--primary)
    color: var(--black)

    &:hover:not(:disabled)
      background-color: transparent
      border-color: var(--primary)
      color: var(--form-text-color)
</style>
