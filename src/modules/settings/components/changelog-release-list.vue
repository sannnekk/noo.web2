<template>
  <noo-error-block
    v-if="error"
    no-margin
    :try-again="tryAgain"
  >
    {{ error.name }}
  </noo-error-block>

  <noo-text-block
    v-else-if="isLoading"
    dimmed
    no-margin
  >
    Загрузка…
  </noo-text-block>

  <noo-text-block
    v-else-if="releases.length === 0"
    dimmed
    no-margin
  >
    Изменений пока нет.
  </noo-text-block>

  <div
    v-else
    class="changelog-release-list"
  >
    <section
      v-for="release in releases"
      :key="release.version"
      class="changelog-release-list__release"
    >
      <header class="changelog-release-list__header">
        <h4 class="changelog-release-list__version">
          {{ release.version }}
        </h4>
        <noo-date
          class="changelog-release-list__date"
          :value="release.date"
          timezones="Europe/Moscow"
        />
      </header>

      <ul class="changelog-release-list__changes">
        <li
          v-for="(change, index) in release.changes"
          :key="`${release.version}-${index}`"
          class="changelog-release-list__change"
        >
          <changelog-change-tag :type="change.type" />
          <span class="changelog-release-list__description">
            {{ change.description }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { ApiError } from '@/core/api/api.utils'
import type { ChangelogRelease } from '../api/platform.types'
import ChangelogChangeTag from './changelog-change-tag.vue'

interface Props {
  releases: ChangelogRelease[]
  isLoading: boolean
  error: ApiError | null
  tryAgain: () => void
}

defineProps<Props>()
</script>

<style lang="sass" scoped>
.changelog-release-list
  display: flex
  flex-direction: column
  gap: 2em
  padding-top: 1.5em

  &__header
    display: flex
    align-items: baseline
    flex-wrap: wrap
    gap: 0.75em
    padding-bottom: 0.4em
    border-bottom: 1px solid var(--border-color)
    margin-bottom: 0.75em

  &__version
    margin: 0
    font-size: 1.1em

  &__date
    font-size: 0.85em
    color: var(--text-light)

  &__changes
    list-style: none
    margin: 0
    padding: 0
    display: flex
    flex-direction: column
    gap: 0.5em

  // Not wrapping: a long description has to wrap inside its own column rather
  // than drop below the tag and leave it alone on a line.
  &__change
    display: flex
    align-items: baseline
    gap: 0.5em

  &__description
    flex: 1 1 auto
    min-width: 0
    color: var(--text-light)
</style>
