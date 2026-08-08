<template>
  <section class="quiz-result">
    <div class="quiz-result__score">
      <span class="quiz-result__score__value">
        {{ shownCount
        }}<span class="quiz-result__score__value__of">/{{ total }}</span>
      </span>
      <span class="quiz-result__score__label">
        {{
          pluralize(correctCount, [
            'верный ответ',
            'верных ответа',
            'верных ответов'
          ])
        }}
      </span>
    </div>

    <noo-title
      :size="3"
      align="center"
      no-margin
    >
      {{ headline }}
    </noo-title>

    <noo-text-block
      align="center"
      dimmed
      size="small"
    >
      {{ subline }}
    </noo-text-block>

    <div class="quiz-result__actions">
      <noo-button @click="emits('restart')"> Пройти ещё раз </noo-button>
      <noo-button
        variant="secondary"
        :to="{ name: 'task-cards.list' }"
      >
        К сохранённым заданиям
      </noo-button>
      <noo-button
        v-if="correctCount > 0"
        variant="tertiary"
        :is-loading="isRemoving"
        @click="emits('remove-correct')"
      >
        Убрать карточки с верными ответами
      </noo-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { pluralize } from '@/core/utils/lang.utils'
import { useTransition } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

interface Props {
  total: number
  correctCount: number
  isRemoving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isRemoving: false
})

const emits = defineEmits<{
  restart: []
  'remove-correct': []
}>()

const ratio = computed(() =>
  props.total ? props.correctCount / props.total : 0
)

// The score counts up to what was earned rather than simply being there. Held
// in a ref the animation eases towards, so the tally reads as the run being
// added up. `useTransition` honours prefers-reduced-motion on its own.
const countTarget = ref(0)
const transitionedCount = useTransition(countTarget, {
  duration: 700,
  transition: [0.2, 0.8, 0.3, 1]
})

const shownCount = computed(() => Math.round(transitionedCount.value))

onMounted(() => {
  countTarget.value = props.correctCount
})

const headline = computed(() => {
  if (ratio.value === 1) {
    return 'Идеально!'
  }

  if (ratio.value >= 0.7) {
    return 'Хороший результат'
  }

  if (ratio.value >= 0.4) {
    return 'Есть над чем поработать'
  }

  return 'Стоит повторить'
})

const subline = computed(() =>
  props.correctCount > 0
    ? 'Карточки с верными ответами можно убрать из сохранённых, чтобы они не повторялись.'
    : 'Карточки остались в сохранённых — попробуйте ещё раз позже.'
)
</script>

<style scoped lang="sass">
.quiz-result
  display: flex
  flex-direction: column
  align-items: center
  gap: var(--space-2xs)
  padding: var(--space-m) var(--space-s)
  border-radius: var(--border-radius)
  background-color: var(--form-background)
  box-shadow: var(--block-shadow)

  &__score
    display: flex
    flex-direction: column
    align-items: center
    gap: 0.1em
    padding: var(--space-2xs) var(--space-m)
    border-radius: var(--border-radius)
    background-color: var(--primary)
    color: var(--black)

    &__value
      font-size: fluid(2rem, 3rem)
      font-weight: 700
      line-height: 1

      &__of
        font-size: 0.5em
        opacity: 0.6

    &__label
      font-size: 0.75rem
      font-weight: 600
      text-transform: uppercase
      letter-spacing: 0.05em

  &__actions
    display: flex
    flex-direction: column
    align-items: stretch
    gap: var(--space-3xs)
    width: min(100%, 22rem)
    margin-top: var(--space-2xs)
</style>
