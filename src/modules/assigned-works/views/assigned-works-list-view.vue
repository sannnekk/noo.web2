<template>
  <div class="assigned-works-list-view">
    <div class="assigned-works-list-view__content">
      <noo-search-view
        v-model:search="searchModel"
        v-model:page="pageModel"
        :items="works"
        :total-count="totalCount"
        :is-loading="isLoading"
        :limit="25"
        :columns="columns"
        :row-link="
          (item) => ({
            name: 'assigned-works.detail',
            params: { assignedWorkId: item.id }
          })
        "
      >
        <template #above-content>
          <div class="assigned-works-list-view__head">
            <div class="assigned-works-list-view__head__filters" />
            <div class="assigned-works-list-view__head__selected">
              <noo-if-animation>
                <div
                  v-if="selectedCount > 0"
                  class="assigned-works-list-view__head__selected__inner"
                >
                  <div class="assigned-works-list-view__head__selected__title">
                    <noo-text-block>
                      Выбрано работ: {{ selectedCount }}
                    </noo-text-block>
                  </div>
                  <div
                    class="assigned-works-list-view__head__selected__actions"
                  >
                    <noo-button
                      variant="inline"
                      @click="selectedItems = {}"
                    >
                      Снять выделение
                    </noo-button>
                    <noo-button
                      variant="inline"
                      @click="onAddHelperMentor()"
                    >
                      Добавить помогающего куратора
                    </noo-button>
                    <noo-button
                      variant="danger"
                      @click="onArchive()"
                    >
                      Архивировать
                    </noo-button>
                  </div>
                </div>
              </noo-if-animation>
            </div>
          </div>
        </template>
        <template #actions>
          <noo-button
            variant="secondary"
            :to="{ name: 'profile', params: { tabId: 'statistics' } }"
          >
            Моя статистика
          </noo-button>
          <noo-button
            variant="primary"
            :to="{ name: 'task-cards.list' }"
          >
            Мои карточки с заданиями
          </noo-button>
        </template>
        <template #column-work="{ item }">
          <div class="assigned-works-list-view__content__work-cell">
            <div class="assigned-works-list-view__content__work-cell__subject">
              <noo-subject-block :subject="item.work?.subject ?? null" />
            </div>
            <div class="assigned-works-list-view__content__work-cell__title">
              <noo-text-block>
                {{ item.title }}
              </noo-text-block>
            </div>
            <div
              v-if="showStudent"
              class="assigned-works-list-view__content__work-cell__user"
            >
              <span
                class="assigned-works-list-view__content__work-cell__user__label"
              >
                Ученик:
              </span>
              <noo-inline-user-card :user="item.student" />
            </div>
            <div
              v-if="showMentors && item.mainMentor"
              class="assigned-works-list-view__content__work-cell__user"
            >
              <span
                class="assigned-works-list-view__content__work-cell__user__label"
              >
                Куратор:
              </span>
              <noo-inline-user-card :user="item.mainMentor" />
            </div>
            <div
              v-if="showMentors && item.helperMentor"
              class="assigned-works-list-view__content__work-cell__user"
            >
              <span
                class="assigned-works-list-view__content__work-cell__user__label"
              >
                Помогающий куратор:
              </span>
              <noo-inline-user-card :user="item.helperMentor" />
            </div>
          </div>
        </template>
        <template #column-status="{ item }">
          <div class="assigned-works-list-view__content__status-cell">
            <noo-solve-status-tag :status="item.solveStatus" />
            <br />
            <noo-check-status-tag :status="item.checkStatus" />
          </div>
        </template>
        <template #column-solve="{ item }">
          <div class="assigned-works-list-view__content__date-cell">
            <noo-date
              timezones="both"
              include-time
              :value="item.solveDeadlineAt"
            />
            <br />
            <noo-date
              timezones="both"
              include-time
              :value="item.solvedAt"
            />
          </div>
        </template>
        <template #column-check="{ item }">
          <div class="assigned-works-list-view__content__date-cell">
            <noo-date
              timezones="both"
              include-time
              :value="item.checkDeadlineAt"
            />
            <br />
            <noo-date
              timezones="both"
              include-time
              :value="item.checkedAt"
            />
          </div>
        </template>
        <template #column-select="{ item }">
          <div class="assigned-works-list-view__content__select-cell">
            <noo-checkbox v-model="selectedItems[item.id]" />
          </div>
        </template>
      </noo-search-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import { useAuthStore } from '@/core/stores/auth.store'
import { computed, ref } from 'vue'
import type { AssignedWorkEntity } from '../api/assigned-work.types'

interface Props {
  works: AssignedWorkEntity[]
  totalCount: number
  isLoading?: boolean
}

interface Emits {
  (e: 'archive', items: AssignedWorkEntity[]): void
  (e: 'add-helper-mentor', items: AssignedWorkEntity[]): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const searchModel = defineModel<string>('search', {
  default: ''
})

const pageModel = defineModel<number>('page', {
  default: 1
})

const selectedItems = ref<Record<string, boolean>>({})
const selectedCount = computed(() => {
  return Object.values(selectedItems.value).filter(Boolean).length
})

const authStore = useAuthStore()

const showStudent = authStore.roleIsOneOf([
  'mentor',
  'assistant',
  'teacher',
  'admin'
])

const showMentors = authStore.roleIsOneOf([
  'student',
  'assistant',
  'teacher',
  'admin'
])

const columns: EntityTableColumnType<AssignedWorkEntity>[] = [
  {
    title: 'Работа',
    key: 'work'
  },
  {
    title: 'Дедлайн сдачи / сдано',
    key: 'solve'
  },
  {
    title: 'Дедлайн проверки / проверено',
    key: 'check'
  },
  {
    title: 'Статус',
    key: 'status'
  },
  {
    title: 'Выбрать',
    key: 'select',
    disableLink: true
  }
]

function onArchive() {
  const selectedWorks = getSelectedWorks()

  if (selectedWorks.length > 0) {
    emits('archive', selectedWorks)
    selectedItems.value = {}
  }
}

function onAddHelperMentor() {
  const selectedWorks = getSelectedWorks()

  if (selectedWorks.length > 0) {
    emits('add-helper-mentor', selectedWorks)
    selectedItems.value = {}
  }
}

function getSelectedWorks() {
  return Object.keys(selectedItems.value)
    .filter((key) => selectedItems.value[key])
    .map((key) => props.works.find((work) => work.id === key))
    .filter(Boolean) as AssignedWorkEntity[]
}
</script>

<style scoped lang="sass">
.assigned-works-list-view
  &__head
    margin-top: 1em

    &__selected
      background-color: var(--light-background-color)

      &__inner
        display: flex
        justify-content: space-between
        align-items: center
        padding: 0 0.5em
        margin: 0.5em 0

      &__actions
        display: flex

  &__content
    &__work-cell
      &__subject
        margin: 0
        padding: 0
        font-size: 0.8em

        &:deep()
          span
            font-weight: normal

      &__title
        margin: 0
        padding: 0

        .noo-text-block
          margin: 0
          font-weight: 500

      &__user
        margin: 0.5em 0 0 0
        padding: 0
        font-size: 0.8em
        color: var(--text-light)

        &__label
          margin-right: 0.5em

    &__date-cell
      font-size: 0.8em
      color: var(--text-light)

    &__select-cell
      display: flex
      justify-content: center
      align-items: center
      width: 100%
      height: 100px

      .noo-checkbox
        width: 100%
        height: 100%
        display: flex
        align-items: center
        justify-content: center
</style>
