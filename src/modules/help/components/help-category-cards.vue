<template>
  <section class="help-category-cards">
    <router-link
      v-for="(item, index) in helpCategories"
      :key="item.category"
      class="help-category-cards__card"
      :style="{ '--card-accent': accents[index % accents.length] }"
      :to="{ name: 'help.articles', params: { category: item.category } }"
    >
      <span class="help-category-cards__card__blob" />
      <div class="help-category-cards__card__icon">
        <noo-icon :name="item.icon" />
      </div>
      <noo-title
        :size="3"
        no-margin
        class="help-category-cards__card__title"
      >
        {{ item.title }}
      </noo-title>
      <p class="help-category-cards__card__description">
        {{ item.description }}
      </p>
      <p class="help-category-cards__card__count">
        {{ countLabel(item.category) }}
      </p>
    </router-link>
  </section>
</template>

<script setup lang="ts">
import type { SupportCategory } from '../api/support.types'
import { helpCategories } from '../content'
import { useHelpHomeStore } from '../stores/help-home.store'

const store = useHelpHomeStore()

/**
 * Alternated across the cards by position, so the row reads as a set rather
 * than three copies of one card.
 */
const accents = ['var(--primary)', 'var(--secondary)']

/**
 * The count is left out until the articles are in, rather than shown as a zero
 * that would read as an empty category while it is still loading.
 */
function countLabel(category: SupportCategory): string {
  if (!store.isLoaded) {
    return ' '
  }

  const count = store.countIn(category)

  if (!count) {
    return 'Скоро появятся статьи'
  }

  return `${count} ${pluralize(count)}`
}

function pluralize(count: number): string {
  const tens = count % 100
  const ones = count % 10

  if (tens > 10 && tens < 20) {
    return 'статей'
  }

  if (ones === 1) {
    return 'статья'
  }

  if (ones >= 2 && ones <= 4) {
    return 'статьи'
  }

  return 'статей'
}
</script>

<style scoped lang="sass">
.help-category-cards
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: var(--space-s)

  +mobile
    grid-template-columns: 1fr

  &__card
    position: relative
    isolation: isolate
    overflow: hidden
    display: block
    text-decoration: none
    color: var(--form-text-color)
    padding: var(--space-s)
    border-radius: var(--border-radius)
    border: 1px solid var(--border-color)
    background-color: var(--form-background)
    transition: border-color 0.2s ease, transform 0.2s ease

    &:hover
      border-color: var(--lila)
      transform: translateY(-2px)

      .help-category-cards__card__blob
        transform: scale(1.25)

    // A flat disc bleeding out of the corner, the same shape language as the
    // auth illustration. Behind the text, and it grows as the card lifts.
    &__blob
      position: absolute
      z-index: -1
      top: -3.5em
      right: -3.5em
      width: 8em
      height: 8em
      border-radius: 50%
      background-color: var(--card-accent, var(--primary))
      opacity: 0.35
      transition: transform 0.3s ease
      transform-origin: 70% 30%

      html.dark &
        opacity: 0.16

    &__icon
      font-size: var(--step-4)
      line-height: 1
      margin-bottom: var(--space-2xs)

    &__title
      margin-bottom: var(--space-3xs)

    &__description
      margin: 0
      color: var(--text-light)
      font-size: var(--step--1)
      line-height: 1.4

    &__count
      margin: var(--space-2xs) 0 0 0
      color: var(--text-light)
      font-size: var(--step--2)
      text-transform: uppercase
      min-height: 1em
</style>
