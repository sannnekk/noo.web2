<template>
  <noo-dialog
    v-model:is-open="isOpen"
    @update:is-open="onToggle"
  >
    <template #trigger="{ toggle }">
      <noo-tiptap-toolbar-button
        icon="link"
        title="Ссылка"
        :active="editor?.isActive('link')"
        @click="toggle"
      />
    </template>
    <template #content="{ close }">
      <div class="noo-tiptap-menu">
        <noo-text-input
          v-model="href"
          label="Ссылка"
          placeholder="https://..."
          @enter-press="apply(close)"
        />
        <div class="noo-tiptap-menu__actions">
          <noo-button
            v-if="editor?.isActive('link')"
            variant="danger-inline"
            size="small"
            @click="remove(close)"
          >
            Убрать
          </noo-button>
          <noo-button
            size="small"
            :disabled="!href"
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
const href = ref('')

// Prefill with the link under the cursor whenever the dialog opens.
function onToggle(opened: boolean) {
  if (opened) {
    href.value = props.editor?.getAttributes('link').href ?? ''
  }
}

function apply(close: () => void) {
  if (!props.editor || !href.value) {
    return
  }

  props.editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: href.value })
    .run()

  close()
}

function remove(close: () => void) {
  props.editor?.chain().focus().extendMarkRange('link').unsetLink().run()
  close()
}
</script>

<style scoped lang="sass" src="./tiptap-menu.sass"></style>
