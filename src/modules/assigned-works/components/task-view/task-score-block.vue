<template>
  <div class="task-score-block">
    <noo-number-input
      v-if="!readonly"
      v-model="model"
      class="task-score-block__input"
      :label="`Баллы, максимум ${maxScore}`"
      :min="0"
      :max="maxScore"
      :step="1"
    />
    <!-- Reused from the sidebar, where the same figure is given for the work as
         a whole — the same shape, one task down. -->
    <noo-assigned-work-score
      v-else-if="isChecked"
      with-label
      :score="model"
      :max-score="maxScore"
    />
    <div
      v-else
      class="task-score-block__pending"
    >
      <noo-text-block
        size="small"
        dimmed
        no-margin
      >
        Оценка
      </noo-text-block>
      <noo-text-block
        size="small"
        dimmed
        no-margin
      >
        Ещё не проверено
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  maxScore: number
  /** Until the answer is checked there is no score to show, only a promise of one. */
  isChecked?: boolean
  readonly?: boolean
}

defineProps<Props>()

const model = defineModel<number | null>('score', { default: null })
</script>

<style scoped lang="sass">
.task-score-block
  &__input
    max-width: 14rem

  &__pending
    display: flex
    align-items: center
    justify-content: space-between
    gap: var(--space-2xs)
</style>
