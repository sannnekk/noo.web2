<template>
  <div
    class="noo-tiptap-math-edit"
    :style="anchorStyle"
  >
    <noo-dialog v-model:is-open="isOpen">
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
              variant="danger-inline"
              size="small"
              @click="remove(close)"
            >
              Удалить
            </noo-button>
            <noo-button
              size="small"
              :disabled="!latex"
              @click="apply(close)"
            >
              Сохранить
            </noo-button>
          </div>
        </div>
      </template>
    </noo-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { computed, ref, watch } from 'vue'

export interface MathEditTarget {
  /** Document position of the math node. */
  pos: number
  /** Inline vs block math, to pick the matching update/delete command. */
  isInline: boolean
  latex: string
  /** Viewport coordinates of the node, used to anchor the popover. */
  top: number
  left: number
}

interface Props {
  editor?: Editor
  target: MathEditTarget
}

const props = defineProps<Props>()

const emit = defineEmits<{ close: [] }>()

const isOpen = ref(true)
const latex = ref(props.target.latex)

const anchorStyle = computed(() => ({
  top: `${props.target.top}px`,
  left: `${props.target.left}px`
}))

// Closing the underlying dialog (esc / outside click) tears down the popover.
watch(isOpen, (opened) => {
  if (!opened) {
    emit('close')
  }
})

function apply(close: () => void) {
  if (!props.editor || !latex.value) {
    return
  }

  const chain = props.editor.chain().focus()
  const options = { latex: latex.value, pos: props.target.pos }

  if (props.target.isInline) {
    chain.updateInlineMath(options).run()
  } else {
    chain.updateBlockMath(options).run()
  }

  close()
}

function remove(close: () => void) {
  if (!props.editor) {
    return
  }

  const chain = props.editor.chain().focus()
  const options = { pos: props.target.pos }

  if (props.target.isInline) {
    chain.deleteInlineMath(options).run()
  } else {
    chain.deleteBlockMath(options).run()
  }

  close()
}
</script>

<style scoped lang="sass">
.noo-tiptap-math-edit
  position: fixed
  z-index: 1000
</style>
