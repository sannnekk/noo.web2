<template>
  <section class="help-hero-search">
    <help-decor class="help-hero-search__decor" />

    <noo-title
      :size="1"
      align="center"
      class="help-hero-search__title"
    >
      Чем помочь?
    </noo-title>
    <noo-text-block
      align="center"
      dimmed
      size="large"
      class="help-hero-search__subtitle"
    >
      Найдите ответ в статьях или напишите нам
    </noo-text-block>

    <div class="help-hero-search__field">
      <noo-search-input
        v-model="search"
        :is-loading="store.isLoading"
      />
    </div>

    <div
      v-if="!query"
      class="help-hero-search__queries"
    >
      <button
        v-for="popular in helpPopularQueries"
        :key="popular"
        type="button"
        class="help-hero-search__queries__item"
        @click="search = popular"
      >
        {{ popular }}
      </button>
    </div>

    <div
      v-else
      class="help-hero-search__results"
    >
      <noo-text-block
        v-if="store.isLoading"
        dimmed
        align="center"
        no-margin
      >
        Ищем…
      </noo-text-block>
      <template v-else-if="results.length">
        <router-link
          v-for="{ article, excerpt } in results"
          :key="article.id"
          class="help-hero-search__results__item"
          :to="{
            name: 'help.articles.detail',
            params: { category: article.category, articleSlug: article.slug }
          }"
        >
          <span class="help-hero-search__results__item__title">
            <span
              v-for="(segment, index) in splitByQuery(article.title, query)"
              :key="index"
              :class="{ 'is-match': segment.isMatch }"
            >
              {{ segment.text }}
            </span>
          </span>
          <span
            v-if="excerpt"
            class="help-hero-search__results__item__excerpt"
          >
            <span
              v-for="(segment, index) in splitByQuery(excerpt, query)"
              :key="index"
              :class="{ 'is-match': segment.isMatch }"
            >
              {{ segment.text }}
            </span>
          </span>
          <span class="help-hero-search__results__item__category">
            {{ categoryTitle(article.category) }}
          </span>
        </router-link>
      </template>
      <div
        v-else
        class="help-hero-search__results__empty"
      >
        <noo-text-block
          align="center"
          no-margin
        >
          По запросу «{{ query }}» ничего не нашлось.
        </noo-text-block>
        <noo-text-block
          v-if="settings"
          align="center"
          dimmed
          size="small"
        >
          Спросите нас в
          <noo-inline-link :href="settings.supportChatLink">
            {{ settings.supportChatName }}
          </noo-inline-link>
          — ответим и заведём статью.
        </noo-text-block>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePlatformSettings } from '@/core/stores/platform-settings.store'
import { computed, shallowRef } from 'vue'
import type { SupportCategory } from '../api/support.types'
import { helpCategories, helpPopularQueries } from '../content'
import { useHelpHomeStore } from '../stores/help-home.store'
import { searchArticles, splitByQuery } from '../utils'
import HelpDecor from './help-decor.vue'

const settings = usePlatformSettings()

/** Below this a query matches most of the section and the results are noise. */
const MIN_QUERY_LENGTH = 2

const store = useHelpHomeStore()

const search = shallowRef('')

const query = computed(() =>
  search.value.trim().length >= MIN_QUERY_LENGTH ? search.value.trim() : ''
)

const results = computed(() =>
  query.value ? searchArticles(store.articles, query.value) : []
)

function categoryTitle(category: SupportCategory): string {
  return helpCategories.find((item) => item.category === category)?.title ?? ''
}
</script>

<style scoped lang="sass">
.help-hero-search
  position: relative
  isolation: isolate
  overflow: hidden
  padding: var(--space-2xl) var(--space-s) var(--space-xl) var(--space-s)
  border-radius: var(--border-radius)
  background-color: var(--light-background-color)

  &__decor
    z-index: -1

  // Everything below the decoration sits above it and keeps its own stacking,
  // so a disc never lands on top of the field or a result.
  > *:not(.help-hero-search__decor)
    position: relative
    z-index: 1

  &__title
    margin-bottom: var(--space-2xs)
    font-size: var(--step-5)

  &__subtitle
    margin-bottom: var(--space-m)

  &__field
    width: min(100%, 38rem)
    margin: 0 auto

  &__queries
    width: min(100%, 38rem)
    margin: var(--space-s) auto 0 auto
    display: flex
    flex-wrap: wrap
    justify-content: center
    gap: var(--space-2xs)

    &__item
      border: 1px solid var(--border-color)
      border-radius: var(--border-radius-button)
      background-color: var(--form-background)
      color: var(--text-light)
      font-family: inherit
      font-size: var(--step--1)
      padding: 0.4em 1em
      cursor: pointer
      transition: color 0.2s ease, border-color 0.2s ease

      &:hover
        color: var(--form-text-color)
        border-color: var(--lila)

  &__results
    width: min(100%, 38rem)
    margin: var(--space-s) auto 0 auto
    display: flex
    flex-direction: column
    gap: var(--space-3xs)

    &__item
      display: block
      text-decoration: none
      color: var(--form-text-color)
      padding: var(--space-2xs) var(--space-xs)
      border-radius: var(--border-radius)
      background-color: var(--form-background)
      border: 1px solid var(--border-color)
      transition: border-color 0.2s ease

      &:hover
        border-color: var(--lila)

      &__title
        display: block
        font-weight: 500

      &__excerpt
        display: block
        margin-top: 0.15em
        font-size: var(--step--1)
        color: var(--text-light)

      &__category
        display: inline-block
        margin-top: 0.4em
        font-size: var(--step--2)
        text-transform: uppercase
        color: var(--text-light)

      // The highlight is always the light brand green, so the text on it is
      // dark in both themes rather than following the theme's text colour.
      .is-match
        background-color: var(--primary)
        color: var(--dark)
        border-radius: 2px

    &__empty
      padding: var(--space-s) 0
</style>
