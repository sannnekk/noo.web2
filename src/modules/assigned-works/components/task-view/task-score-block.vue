<template>
  <div class="task-score-block">
    <noo-select-input
      v-if="!readonly"
      v-model="model"
      class="task-score-block__input"
      :label="`Баллы, максимум ${maxScore}`"
      :options="scoreOptions"
    />
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
import { computed } from 'vue'

interface Props {
  maxScore: number
  isChecked?: boolean
  readonly?: boolean
}

const props = defineProps<Props>()

const model = defineModel<number | null>('score', { default: null })

const scoreOptions = computed(() => {
  const options = []

  for (let i = 0; i <= props.maxScore; i++) {
    options.push({ label: String(i), value: i })
  }

  return options
})
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
