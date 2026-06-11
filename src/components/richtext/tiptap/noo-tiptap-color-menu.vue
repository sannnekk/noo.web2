<template>
  <noo-dialog v-model:is-open="isOpen">
    <template #trigger="{ toggle }">
      <noo-tiptap-toolbar-button
        icon="color"
        title="Цвет текста"
        :active="hasColor"
        @click="toggle"
      />
    </template>
    <template #content="{ close }">
      <div class="noo-tiptap-color-menu">
        <button
          v-for="color in colors"
          :key="color.name"
          type="button"
          class="noo-tiptap-color-menu__swatch"
          :class="{
            'noo-tiptap-color-menu__swatch--active': isActive(color.value)
          }"
          :style="{ backgroundColor: color.value }"
          :title="color.title"
          @click="apply(color.value, close)"
        />
        <button
          type="button"
          class="noo-tiptap-color-menu__reset"
          title="Сбросить цвет"
          @click="reset(close)"
        >
          ✕
        </button>
      </div>
    </template>
  </noo-dialog>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { computed, ref } from 'vue'

interface Props {
  editor?: Editor
}

const props = defineProps<Props>()

const isOpen = ref(false)

// Values are kept as CSS custom properties so colours follow the active theme.
const colors = [
  { name: 'primary', title: 'Основной', value: 'var(--primary)' },
  { name: 'secondary', title: 'Вторичный', value: 'var(--secondary)' },
  { name: 'success', title: 'Успех', value: 'var(--success)' },
  { name: 'warning', title: 'Предупреждение', value: 'var(--warning)' },
  { name: 'danger', title: 'Опасность', value: 'var(--danger)' }
]

const hasColor = computed(() => colors.some((color) => isActive(color.value)))

function isActive(value: string): boolean {
  return !!props.editor?.isActive('textStyle', { color: value })
}

function apply(value: string, close: () => void) {
  props.editor?.chain().focus().setColor(value).run()
  close()
}

function reset(close: () => void) {
  props.editor?.chain().focus().unsetColor().run()
  close()
}
</script>

<style scoped lang="sass">
.noo-tiptap-color-menu
  display: flex
  align-items: center
  gap: 0.5em
  flex-wrap: wrap

  &__swatch
    width: 1.6em
    height: 1.6em
    padding: 0
    border-radius: 50%
    border: 2px solid var(--border-color)
    cursor: pointer

    &--active
      border-color: var(--form-text-color)
      box-shadow: 0 0 0 2px var(--form-background), 0 0 0 4px var(--form-text-color)

  &__reset
    width: 1.6em
    height: 1.6em
    padding: 0
    border-radius: 50%
    border: 2px solid var(--border-color)
    background-color: var(--form-background)
    color: var(--form-text-color)
    cursor: pointer
    line-height: 1
    display: inline-flex
    align-items: center
    justify-content: center
</style>
