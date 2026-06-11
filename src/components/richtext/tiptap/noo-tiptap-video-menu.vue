<template>
  <noo-dialog v-model:is-open="isOpen">
    <template #trigger="{ toggle }">
      <noo-tiptap-toolbar-button
        icon="video"
        title="Видео"
        :active="editor?.isActive('iframe')"
        @click="toggle"
      />
    </template>
    <template #content="{ close }">
      <div class="noo-tiptap-menu">
        <noo-text-input
          v-model="src"
          label="Ссылка на видео"
          placeholder="https://..."
          @enter-press="apply(close)"
        />
        <div class="noo-tiptap-menu__actions">
          <noo-button
            size="small"
            :disabled="!src"
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
const src = ref('')

function apply(close: () => void) {
  if (!props.editor || !src.value) {
    return
  }

  props.editor.chain().focus().setIframe({ src: src.value }).run()

  src.value = ''
  close()
}
</script>

<style scoped lang="sass" src="./tiptap-menu.sass"></style>
