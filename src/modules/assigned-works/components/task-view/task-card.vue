<template>
  <section
    class="task-card"
    :style="{ '--task-card-accent': accent }"
  >
    <header class="task-card__head">
      <div class="task-card__head__lead">
        <span
          v-if="badge"
          class="task-card__head__badge"
        >
          {{ badge }}
        </span>
        <noo-title
          :size="4"
          no-margin
          class="task-card__head__title"
        >
          {{ title }}
        </noo-title>
      </div>
      <div
        v-if="$slots.meta"
        class="task-card__head__meta"
      >
        <slot name="meta" />
      </div>
    </header>

    <div class="task-card__body">
      <slot />
    </div>

    <footer
      v-if="$slots.footer"
      class="task-card__footer"
    >
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
  /**
   * Colour of the stripe down the left edge. The one thing that tells the
   * blocks of a task apart at a glance, so each block owns a colour of the
   * app's palette rather than a shade of its own.
   */
  accent?: string
  /** Short marker in front of the title, e.g. the task number. */
  badge?: string | number
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.task-card
  background-color: var(--lightest)
  border-radius: var(--border-radius)
  box-shadow: var(--block-shadow)
  border-left: 4px solid var(--task-card-accent, none)
  padding: var(--space-s)

  &__head
    display: flex
    align-items: center
    justify-content: space-between
    flex-wrap: wrap
    gap: var(--space-3xs) var(--space-2xs)

    &__lead
      display: flex
      align-items: center
      gap: 0.5em
      min-width: 0

    &__badge
      display: flex
      align-items: center
      justify-content: center
      min-width: 1.8em
      height: 1.8em
      padding: 0 0.4em
      border-radius: var(--border-radius)
      background-color: var(--primary)
      color: var(--black)
      font-weight: 700
      font-size: 0.9em
      flex-shrink: 0

    &__title
      min-width: 0

    &__meta
      display: flex
      align-items: center
      gap: var(--space-3xs)
      margin-left: auto

  &__body
    // The hairline reads as the seam between the framing and the content, and
    // keeps the card legible when the content is a wall of rich text.
    margin-top: var(--space-2xs)
    padding-top: var(--space-2xs)
    border-top: 1px solid var(--border-color)

  &__footer
    margin-top: var(--space-2xs)
    padding-top: var(--space-2xs)
    border-top: 1px solid var(--border-color)
</style>
