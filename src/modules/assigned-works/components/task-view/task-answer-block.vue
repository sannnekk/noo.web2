<template>
  <task-card
    class="task-answer-block"
    :title="title"
  >
    <template #meta>
      <span
        class="task-answer-block__status"
        :class="`task-answer-block__status--${answer.status}`"
      >
        {{ statusLabel }}
      </span>
    </template>

    <word-task-container
      v-if="task.type === 'word'"
      :model-value="answer.wordContent"
      :readonly="readonly"
      @update:model-value="(wordContent) => emit('update', { wordContent })"
    />
    <!-- The rest are rich text today, but each keeps its own container: essays
         are due a word counter and a detailed score, dictations their own
         breakdown of mistakes. -->
    <text-task-container
      v-else-if="task.type === 'text'"
      :model-value="answer.richTextContent"
      :readonly="readonly"
      @update:model-value="
        (richTextContent) => emit('update', { richTextContent })
      "
    />
    <essay-task-container
      v-else-if="task.type === 'essay'"
      :model-value="answer.richTextContent"
      :readonly="readonly"
      @update:model-value="
        (richTextContent) => emit('update', { richTextContent })
      "
    />
    <final-essay-task-container
      v-else-if="task.type === 'final-essay'"
      :model-value="answer.richTextContent"
      :readonly="readonly"
      @update:model-value="
        (richTextContent) => emit('update', { richTextContent })
      "
    />
    <dictation-task-container
      v-else-if="task.type === 'dictation'"
      :model-value="answer.richTextContent"
      :readonly="readonly"
      @update:model-value="
        (richTextContent) => emit('update', { richTextContent })
      "
    />

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </task-card>
</template>

<script setup lang="ts">
import type { WorkTaskEntity } from '@/modules/works/api/work.types'
import { computed } from 'vue'
import type { PossiblyUnsavedAnswer } from '../../types'
import dictationTaskContainer from '../dictation-task-container.vue'
import essayTaskContainer from '../essay-task-container.vue'
import finalEssayTaskContainer from '../final-essay-task-container.vue'
import textTaskContainer from '../text-task-container.vue'
import wordTaskContainer from '../word-task-container.vue'
import taskCard from './task-card.vue'

interface Props {
  task: WorkTaskEntity
  answer: PossiblyUnsavedAnswer
  title: string
  readonly?: boolean
}

/**
 * Which field of the answer a task type writes to is the container's business,
 * so edits leave here as a patch. A type that starts writing more than one
 * field is then a change to this block alone.
 */
type Emits = (e: 'update', patch: Partial<PossiblyUnsavedAnswer>) => void

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<Emits>()

const statusLabel = computed(() => {
  switch (props.answer.status) {
    case 'submitted':
      return 'На проверке'
    case 'checked':
      return 'Проверен'
    case 'not-submitted':
    default:
      return 'Черновик'
  }
})
</script>

<style scoped lang="sass">
.task-answer-block
  &__status
    font-size: 0.75em
    font-weight: 700
    white-space: nowrap
    padding: 0.15em 0.5em
    border-radius: var(--border-radius)
    background-color: var(--light-background-color)
    color: var(--text-light)

    // The same three-step reading as the rest of the work: nothing yet, in
    // somebody else's hands, done.
    &--submitted
      color: var(--warning)

    &--checked
      color: var(--success)
</style>
