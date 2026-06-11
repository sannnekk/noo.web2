<template>
  <noo-dialog v-model:is-open="isOpen">
    <template #trigger="{ toggle }">
      <noo-tiptap-toolbar-button
        icon="latex"
        title="Математическая формула"
        @click="toggle"
      />
    </template>
    <template #content="{ close }">
      <div class="noo-tiptap-menu">
        <noo-text-input
          v-model="latex"
          label="Формула (LaTeX)"
          placeholder="e^{i\pi} + 1 = 0"
          @enter-press="apply(close)"
        />
        <div class="noo-tiptap-menu__actions">
          <noo-button
            size="small"
            :disabled="!latex"
            @click="apply(close)"
          >
            Вставить
          </noo-button>
        </div>
      </div>
    </template>
  </noo-dialog>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { ref } from 'vue'

interface Props {
  editor?: Editor
}

const props = defineProps<Props>()

const isOpen = ref(false)
const latex = ref('')

function apply(close: () => void) {
  if (!props.editor || !latex.value) {
    return
  }

  props.editor.chain().focus().insertInlineMath({ latex: latex.value }).run()

  latex.value = ''
  close()
}
</script>

<style scoped lang="sass" src="./tiptap-menu.sass"></style>
