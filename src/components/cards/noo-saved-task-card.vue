<template>
  <article class="noo-saved-task-card">
    <header class="noo-saved-task-card__head">
      <div class="noo-saved-task-card__head__lead">
        <noo-subject-block
          v-if="savedTask.work?.subject"
          :subject="savedTask.work.subject"
        />
        <span class="noo-saved-task-card__head__score">
          {{ savedTask.task.maxScore }}
          {{ pluralize(savedTask.task.maxScore, ['балл', 'балла', 'баллов']) }}
        </span>
      </div>
      <noo-dropdown
        v-if="actions?.length"
        :actions="actions"
      />
    </header>

    <noo-title
      :size="4"
      no-margin
      class="noo-saved-task-card__title"
    >
      {{ savedTask.work?.title ?? 'Работа удалена' }}
    </noo-title>

    <p class="noo-saved-task-card__origin">
      Задание {{ savedTask.task.order }} · сохранено
      <noo-date :value="savedTask.createdAt" />
    </p>

    <div class="noo-saved-task-card__content">
      <noo-richtext-block :value="savedTask.task.content" />
    </div>

    <footer
      v-if="$slots.footer"
      class="noo-saved-task-card__footer"
    >
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { DropdownAction } from '@/components/dialog/noo-dropdown.vue'
import { pluralize } from '@/core/utils/lang.utils'
import type { SavedTaskEntity } from '@/modules/task-cards/api/saved-task.types'

interface Props {
  savedTask: SavedTaskEntity
  actions?: DropdownAction[]
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-saved-task-card
  display: flex
  flex-direction: column
  height: 100%
  padding: var(--space-2xs) var(--space-xs) var(--space-xs)
  border-radius: var(--border-radius)
  background-color: var(--lightest)
  box-shadow: var(--block-shadow)
  // The stripe carries the same meaning as on the task view: this block is a
  // task statement.
  border-left: 4px solid var(--secondary)

  &__head
    display: flex
    align-items: center
    justify-content: space-between
    gap: var(--space-3xs)
    min-height: 2em

    &__lead
      display: flex
      align-items: center
      gap: var(--space-2xs)
      min-width: 0

    &__score
      font-size: 0.7em
      font-weight: 700
      white-space: nowrap
      padding: 0.15em 0.5em
      border-radius: var(--border-radius)
      background-color: var(--light-background-color)
      color: var(--text-light)

  &__title
    margin-top: 0.2em
    overflow-wrap: anywhere

  &__origin
    margin: 0.2em 0 0
    font-size: 0.75em
    color: var(--text-light)

  &__content
    position: relative
    margin-top: var(--space-2xs)
    padding-top: var(--space-2xs)
    border-top: 1px solid var(--border-color)
    // Cards stay the same height whatever the task; the tail of a long
    // statement fades out instead of being cut mid-line.
    max-height: 11em
    overflow: hidden

    &::after
      content: ''
      position: absolute
      inset: auto 0 0 0
      height: 3em
      background: linear-gradient(to bottom, transparent, var(--lightest))
      pointer-events: none

  &__footer
    display: flex
    flex-wrap: wrap
    justify-content: flex-end
    gap: var(--space-3xs)
    margin-top: auto
    padding-top: var(--space-2xs)
</style>
