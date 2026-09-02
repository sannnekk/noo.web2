<template>
  <noo-section
    title="С чего начать"
    description="Путь от первого входа до проверенной работы"
  >
    <ol class="help-quick-start">
      <li
        v-for="(step, index) in helpQuickStartSteps"
        :key="step.title"
        class="help-quick-start__step"
        :style="{ '--step-accent': accents[index % accents.length] }"
      >
        <div class="help-quick-start__step__number">{{ index + 1 }}</div>
        <div class="help-quick-start__step__body">
          <noo-title
            :size="4"
            no-margin
          >
            {{ step.title }}
          </noo-title>
          <p class="help-quick-start__step__body__description">
            {{ step.description }}
          </p>
          <noo-inline-link
            v-if="step.category"
            size="small"
            :to="{
              name: 'help.articles',
              params: { category: step.category }
            }"
          >
            Подробнее
          </noo-inline-link>
        </div>
      </li>
    </ol>
  </noo-section>
</template>

<script setup lang="ts">
import { helpQuickStartSteps } from '../content'

/**
 * Alternated across the numbered discs so the six steps read as a sequence
 * rather than six of the same badge. Same colours the category cards use.
 */
const accents = ['var(--primary)', 'var(--secondary)']
</script>

<style scoped lang="sass">
.help-quick-start
  list-style: none
  margin: 0
  padding: 0
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: var(--space-m) var(--space-s)

  +tablet-down
    grid-template-columns: repeat(2, 1fr)

  +mobile
    grid-template-columns: 1fr

  &__step
    display: flex
    gap: var(--space-2xs)

    &__number
      flex-shrink: 0
      width: 1.8em
      height: 1.8em
      display: flex
      align-items: center
      justify-content: center
      border-radius: 50%
      background-color: var(--step-accent, var(--primary))
      // The accents are all light brand colours, so the numeral on them stays
      // dark in both themes rather than following the theme's text colour.
      color: var(--dark)
      font-weight: bold

    &__body
      &__description
        margin: 0.25em 0 0.25em 0
        color: var(--text-light)
        font-size: var(--step--1)
        line-height: 1.4
</style>
