<template>
  <noo-collapsable-block
    v-if="isVisible"
    class="task-hint-block"
    :default-open="presentation === 'expanded'"
  >
    <template #collapsed>
      <span class="task-hint-block__title">{{ title }}</span>
    </template>
    <template #visible>
      <div class="task-hint-block__content">
        <noo-richtext-block :value="content" />
      </div>
    </template>
  </noo-collapsable-block>
</template>

<script setup lang="ts">
import { richTextIsEmpty, type IRichText } from '@/core/utils/richtext.utils'
import { computed } from 'vue'
import type { TaskHintPresentation } from '../../types'

interface Props {
  title: string
  content: IRichText | null
  presentation: TaskHintPresentation
}

const props = defineProps<Props>()

// A hint the task's author never wrote is not a hint being withheld — there is
// nothing to show, whatever the mode asked for.
const isVisible = computed(
  () =>
    props.presentation !== 'hidden' &&
    !!props.content &&
    !richTextIsEmpty(props.content)
)
</script>

<style scoped lang="sass">
// Quieter than the cards above it: a hint is an aside to the task, not another
// part of it, so it stays on the recessed surface and can be folded away.
.task-hint-block
  &__title
    font-weight: 600
    font-size: 0.9em

  &__content
    padding: var(--space-2xs) 0 var(--space-2xs) 1.9em
</style>
