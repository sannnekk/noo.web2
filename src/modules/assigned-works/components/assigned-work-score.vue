<template>
  <div class="assigned-work-score">
    <noo-text-block
      class="assigned-work-score__label"
      size="small"
      dimmed
    >
      Результат:
    </noo-text-block>
    <div class="assigned-work-score__value">
      <noo-title
        class="assigned-work-score__value__main"
        :size="3"
      >
        {{ scorePercentageText }}
      </noo-title>
      <noo-text-block
        class="assigned-work-score__value__secondary"
        size="small"
        dimmed
      >
        {{ scoreText }}
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  score: number | null
  maxScore: number
}

const props = defineProps<Props>()

const scorePercentageText = computed(() => {
  if (props.maxScore === 0) {return '0%'}
  if (props.score === null) {return '-'}

  return String(Math.round((props.score / props.maxScore) * 100)) + '%'
})

const scoreText = computed(() => {
  if (props.score === null) {return 'Не оценено'}

  return props.score.toString()
})
</script>

<style scoped lang="sass">
.assigned-work-score
  display: flex
  align-items: center
  justify-content: space-between

  &__label
    color: var(--text-light)

  &__value
    display: flex
    flex-direction: column
    align-items: flex-end

    &__main
      margin: 0

    &__secondary
      margin: 0
</style>
