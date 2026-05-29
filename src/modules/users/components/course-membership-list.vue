<template>
  <div class="course-membership-list">
    <div
      v-if="isLoading"
      class="course-membership-list__loading"
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
      v-else-if="!memberships.length"
      dimmed
      no-margin
    >
      {{ emptyText }}
    </noo-text-block>
    <ul
      v-else
      class="course-membership-list__items"
    >
      <li
        v-for="membership in memberships"
        :key="membership.id"
        class="course-membership-list__item"
      >
        <div class="course-membership-list__item__thumbnail">
          <noo-uploaded-image :src="membership.course?.thumbnail" />
        </div>
        <div class="course-membership-list__item__main">
          <noo-subject-block :subject="membership.course?.subject!" />
          <router-link
            v-if="membership.course"
            class="course-membership-list__item__title"
            :to="{
              name: 'courses.detail',
              params: { courseId: membership.courseId }
            }"
          >
            {{ membership.course.name }}
          </router-link>
          <div class="course-membership-list__item__meta">
            <span class="course-membership-list__item__meta__row">
              <span class="course-membership-list__item__meta__label">
                Назначен:
              </span>
              <noo-date
                :value="membership.createdAt"
                include-time
                timezones="both"
              />
            </span>
            <span
              v-if="membership.assigner"
              class="course-membership-list__item__meta__row"
            >
              <span class="course-membership-list__item__meta__label">
                Назначил(a):
              </span>
              <noo-inline-user-card :user="membership.assigner" />
            </span>
          </div>
        </div>
        <div class="course-membership-list__item__tags">
          <noo-active-tag :active="membership.isActive" />
          <course-membership-type-tag :type="membership.type" />
        </div>
        <div
          v-if="canManage"
          class="course-membership-list__item__actions"
        >
          <noo-button
            variant="inline"
            size="small"
            :is-loading="busyMembershipId === membership.id"
            @click="emit('edit', membership)"
          >
            Изменить
          </noo-button>

          <noo-button
            variant="danger-inline"
            size="small"
            :is-loading="busyMembershipId === membership.id"
            @click="emit('remove', membership)"
          >
            Удалить
          </noo-button>
        </div>
      </li>
    </ul>

    <noo-text-block
      v-if="!isLoading"
      size="small"
      dimmed
    >
      Всего: {{ memberships?.length ?? 0 }}
      {{ pluralize(memberships?.length ?? 0, ['курс', 'курса', 'курсов']) }}
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { pluralize } from '@/core/utils/lang.utils'
import CourseMembershipTypeTag from '../components/course-membership-type-tag.vue'
import type { CourseMembershipEntity } from '@/modules/courses/api/course.types'

interface Props {
  memberships: CourseMembershipEntity[]
  isLoading: boolean
  hasError: boolean
  emptyText: string
  /**
   * Whether the current user can remove memberships.
   */
  canManage?: boolean
  /**
   * Membership id currently being mutated, used to show a loader on its row.
   */
  busyMembershipId?: string | null
}

withDefaults(defineProps<Props>(), {
  canManage: false,
  busyMembershipId: null
})

const emit = defineEmits<Emits>()

interface Emits {
  (e: 'retry'): void
  (e: 'edit', membership: CourseMembershipEntity): void
  (e: 'remove', membership: CourseMembershipEntity): void
}
</script>

<style scoped lang="sass">
.course-membership-list
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

    &__tags
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.5em
      flex-shrink: 0

    &__actions
      display: flex
      gap: 0.25em
      flex-shrink: 0
</style>
