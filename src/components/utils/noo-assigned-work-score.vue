<template>
  <div class="noo-assigned-work-score">
    <noo-text-block
      v-if="withLabel"
      class="noo-assigned-work-score__label"
      size="small"
      dimmed
    >
      Результат:
    </noo-text-block>
    <div class="noo-assigned-work-score__value">
      <noo-title
        class="noo-assigned-work-score__value__main"
        :size="3"
      >
        {{ scorePercentageText }}
      </noo-title>
      <noo-text-block
        class="noo-assigned-work-score__value__secondary"
        size="small"
        dimmed
      >
        {{ scoreText }}
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  withLabel?: boolean
  score: number | null
  maxScore: number
}

const props = defineProps<Props>()

const scorePercentageText = computed(() => {
  if (props.maxScore === 0) {
    return '0%'
  }
  if (props.score === null) {
    return '- %'
  }

  return String(Math.round((props.score / props.maxScore) * 100)) + '%'
})

const scoreText = computed(() => {
  return `${props.score ?? '-'} / ${props.maxScore.toString()}`
})
</script>

<style scoped lang="sass">
.noo-assigned-work-score
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
