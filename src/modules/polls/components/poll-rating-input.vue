<template>
  <noo-number-input
    v-if="!isStarScale"
    v-model="model"
    label="Ваша оценка"
    :min="min"
    :max="max"
    :step="1"
  />
  <div
    v-else
    class="poll-rating-input"
  >
    <div
      class="poll-rating-input__stars"
      @mouseleave="hovered = null"
    >
      <button
        v-for="value in values"
        :key="value"
        type="button"
        class="poll-rating-input__stars__star"
        :class="{
          'poll-rating-input__stars__star--filled': isFilled(value)
        }"
        :aria-label="`Оценка ${value}`"
        :aria-pressed="model === value"
        @click="select(value)"
        @mouseenter="hovered = value"
      >
        <noo-icon name="star" />
      </button>
    </div>
    <noo-text-block
      class="poll-rating-input__value"
      size="small"
      dimmed
      no-margin
    >
      {{ model === null ? 'Нет оценки' : `${model} из ${max}` }}
    </noo-text-block>
    <noo-button
      v-if="model !== null"
      variant="inline"
      size="small"
      @click="model = null"
    >
      Сбросить
    </noo-button>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'

interface Props {
  min?: number | null
  max?: number | null
}

const props = defineProps<Props>()

const model = defineModel<number | null>({ default: null })

const hovered = shallowRef<number | null>(null)

const min = computed(() => props.min ?? 1)
const max = computed(() => props.max ?? 5)

// A row of stars only reads as a rating while you can count them at a glance —
// wider scales are better served by a plain number.
const isStarScale = computed(
  () => max.value > min.value && max.value - min.value + 1 <= 10
)

const values = computed(() =>
  Array.from(
    { length: max.value - min.value + 1 },
    (_, index) => min.value + index
  )
)

function isFilled(value: number): boolean {
  return value <= (hovered.value ?? model.value ?? min.value - 1)
}

function select(value: number): void {
  model.value = model.value === value ? null : value
}
</script>

<style scoped lang="sass">
.poll-rating-input
  display: flex
  align-items: center
  flex-wrap: wrap
  gap: var(--space-3xs) var(--space-2xs)

  &__stars
    display: flex
    align-items: center
    gap: 0.15em
    font-size: 1.6em

    &__star
      display: flex
      padding: 0.1em
      border: none
      background: none
      cursor: pointer
      line-height: 1
      // The star paints itself with `--form-text-color`, so the fill is a
      // variable override rather than a class on the icon itself.
      --form-text-color: var(--border-color)
      transition: transform 0.1s ease-in-out

      &:hover
        transform: scale(1.1)

      &--filled
        --form-text-color: var(--primary)

  &__value
    font-size: 0.9em
</style>
