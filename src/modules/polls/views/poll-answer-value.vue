<template>
  <div
    v-if="type === 'files' && files.length"
    class="poll-answer-value poll-answer-value__files"
  >
    <noo-file-card
      v-for="media in files"
      :key="media.id"
      :name="media.actualName ?? media.name"
      :extension="media.extension"
      :size="media.size"
      :media="media"
      :removable="false"
      downloadable
    />
  </div>

  <noo-text-block
    v-else-if="isEmpty"
    class="poll-answer-value"
    dimmed
    no-margin
  >
    Без ответа
  </noo-text-block>

  <noo-date
    v-else-if="type === 'date' || type === 'date-time'"
    :value="value as string"
    timezones="both"
    :include-time="type === 'date-time'"
  />

  <ul
    v-else-if="Array.isArray(value)"
    class="poll-answer-value poll-answer-value__list"
  >
    <li
      v-for="(entry, index) in value"
      :key="index"
    >
      {{ stringify(entry) }}
    </li>
  </ul>

  <noo-text-block
    v-else
    class="poll-answer-value"
    no-margin
  >
    {{ displayValue }}
  </noo-text-block>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PollAnswerEntity } from '../api/poll.types'

interface Props {
  answer: PollAnswerEntity
}

const props = defineProps<Props>()

const type = computed(() => props.answer.value.type)
const value = computed(() => props.answer.value.value)

// A file answer keeps nothing in its value: the files are the answer, and they
// are attached to it rather than stored in it.
const files = computed(() => props.answer.medias ?? [])

const isEmpty = computed(() => {
  const current = value.value

  return (
    current === null ||
    current === undefined ||
    current === '' ||
    (Array.isArray(current) && current.length === 0)
  )
})

const displayValue = computed(() => {
  const current = value.value

  if (typeof current === 'boolean') {
    return current ? 'Да' : 'Нет'
  }

  return stringify(current)
})

function stringify(input: unknown): string {
  if (input === null || input === undefined) {
    return ''
  }

  if (typeof input === 'object') {
    return JSON.stringify(input)
  }

  return String(input)
}
</script>

<style scoped lang="sass">
.poll-answer-value
  &__list
    margin: 0
    padding-left: 1.2em

  &__files
    display: flex
    flex-direction: column
    gap: var(--space-3xs)
</style>
