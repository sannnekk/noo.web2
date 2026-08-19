<template>
  <noo-base-modal v-model:is-open="isOpenModel">
    <template #title>
      <noo-title :size="2"> Правильный ответ </noo-title>
    </template>
    <template #content>
      <div
        v-if="isLoading"
        class="task-answer-key-modal__loading"
      >
        <noo-loader-icon />
      </div>
      <noo-error-block
        v-else-if="error"
        :try-again="tryAgain"
      >
        <noo-text-block
          dimmed
          size="small"
          no-margin
        >
          Не удалось получить ответ
        </noo-text-block>
      </noo-error-block>
      <template v-else>
        <ul
          v-if="rightAnswers.length"
          class="task-answer-key-modal__answers"
        >
          <li
            v-for="(answer, index) in rightAnswers"
            :key="index"
            class="task-answer-key-modal__answers__item"
          >
            {{ answer }}
          </li>
        </ul>
        <noo-text-block
          v-else
          dimmed
          size="small"
          no-margin
        >
          У этого задания нет заданного ответа
        </noo-text-block>

        <noo-text-block
          v-if="rightAnswers.length > 1"
          dimmed
          size="small"
        >
          Любой из этих ответов засчитывается.
        </noo-text-block>
      </template>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import type { ApiError } from '@/core/api/api.utils'

interface Props {
  rightAnswers: string[]
  isLoading?: boolean
  error?: ApiError | null
  tryAgain?: () => void
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  tryAgain: undefined
})

const isOpenModel = defineModel<boolean>('isOpen', { default: false })
</script>

<style scoped lang="sass">
.task-answer-key-modal
  &__loading
    display: flex
    justify-content: center
    font-size: 1.5em
    padding: var(--space-s)

  &__answers
    display: flex
    flex-direction: column
    gap: var(--space-3xs)
    margin: 0
    padding: 0
    list-style: none

    &__item
      padding: var(--space-3xs) var(--space-2xs)
      border-radius: var(--border-radius)
      background-color: var(--light-background-color)
      font-weight: 700
</style>
