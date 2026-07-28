<template>
  <div class="authored-course-list">
    <div
      v-if="isLoading"
      class="authored-course-list__loading"
    >
      <noo-loader-icon contrast />
    </div>
    <noo-error-block
      v-else-if="hasError"
      no-margin
      :try-again="() => emit('retry')"
    >
      Не удалось загрузить список курсов.
    </noo-error-block>
    <noo-text-block
      v-else-if="!courses.length"
      dimmed
      no-margin
    >
      {{ emptyText }}
    </noo-text-block>
    <ul
      v-else
      class="authored-course-list__items"
    >
      <li
        v-for="course in courses"
        :key="course.id"
        class="authored-course-list__item"
      >
        <div class="authored-course-list__item__thumbnail">
          <noo-uploaded-image :src="course.thumbnail" />
        </div>
        <div class="authored-course-list__item__main">
          <noo-subject-block :subject="course.subject!" />
          <router-link
            class="authored-course-list__item__title"
            :to="{
              name: 'courses.detail',
              params: { courseId: course.id }
            }"
          >
            {{ course.name }}
          </router-link>
          <div class="authored-course-list__item__meta">
            <span class="authored-course-list__item__meta__row">
              <span class="authored-course-list__item__meta__label">
                Создан:
              </span>
              <noo-date :value="course.createdAt" />
            </span>
            <span
              v-if="course.memberCount !== null"
              class="authored-course-list__item__meta__row"
            >
              <span class="authored-course-list__item__meta__label">
                Учеников:
              </span>
              {{ course.memberCount ?? 0 }}
            </span>
          </div>
        </div>
        <div
          v-if="course.isArchived"
          class="authored-course-list__item__archived"
        >
          В архиве
        </div>
      </li>
    </ul>

    <noo-text-block
      v-if="!isLoading"
      size="small"
      dimmed
    >
      Всего: {{ courses.length }}
      {{ pluralize(courses.length, ['курс', 'курса', 'курсов']) }}
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { pluralize } from '@/core/utils/lang.utils'
import type { CourseEntity } from '@/modules/courses/api/course.types'

interface Props {
  courses: CourseEntity[]
  isLoading: boolean
  hasError: boolean
  emptyText: string
}

type Emits = (e: 'retry') => void

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<style scoped lang="sass">
.authored-course-list
  &__loading
    display: flex
    justify-content: center
    font-size: 2em

  &__items
    list-style: none
    padding: 0
    margin: 0
    display: flex
    flex-direction: column
    gap: 0.5em

  &__item
    display: flex
    align-items: center
    gap: 1em
    flex-wrap: wrap

    &__thumbnail
      img
        height: 7em
        border-radius: var(--border-radius)

    &__main
      flex: 1 1 auto
      min-width: 0
      display: flex
      flex-direction: column
      gap: 0.2em

    &__title
      font-weight: 500
      color: var(--form-text-color)
      text-decoration: none

      &:hover
        text-decoration: underline

    &__meta
      display: flex
      flex-direction: column
      gap: 0.15em
      font-size: 0.85em
      color: var(--text-light)
      margin-top: 0.25em

      &__row
        display: inline-flex
        align-items: center
        gap: 0.4em
        flex-wrap: wrap

      &__label
        color: var(--text-light)

    &__archived
      flex-shrink: 0
      font-size: 0.8em
      color: var(--text-light)
      border: 1px solid var(--border-color)
      border-radius: var(--border-radius)
      padding: 0.2em 0.6em
</style>
