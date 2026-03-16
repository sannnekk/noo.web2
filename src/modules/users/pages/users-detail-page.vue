<template>
  <div class="users-detail-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <div class="users-detail-page__sidebar">
          <div class="users-detail-page__sidebar__avatar">
            <noo-user-avatar name="Александр Иванов" />
          </div>
          <div class="users-detail-page__sidebar__info">
            <noo-title :size="3"> Александр Иванов </noo-title>
            <noo-text-block
              size="small"
              dimmed
            >
              teacher
              <br />
              example@outlook.com
            </noo-text-block>
          </div>
        </div>
      </template>
      <template #content>
        <noo-tabs-layout
          use-route-tabs
          route-param-name="tabId"
        >
          <template #tab-title-general-info>Общая информация</template>
          <template #tab-general-info>
            <general-info-view />
          </template>
          <template #tab-title-calendar>Календарь</template>
          <template #tab-calendar>
            <calendar-view />
          </template>
          <template #tab-title-statistics>Статистика</template>
          <template #tab-statistics>
            <statistics-view />
          </template>
          <template #tab-title-assigned-works>Работы</template>
          <template #tab-assigned-works>
            <assigned-works-view />
          </template>
          <template #tab-title-polls>Опросы</template>
          <template #tab-polls>
            <polls-view />
          </template>
          <template #tab-title-history>История</template>
          <template #tab-history>
            <history-view />
          </template>
          <template #tab-title-danger-zone>Опасная зона</template>
          <template #tab-danger-zone>
            <danger-zone-view />
          </template>
        </noo-tabs-layout>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import type { UserDetailTab } from '../types'
import assignedWorksView from '../views/assigned-works-view.vue'
import calendarView from '../views/calendar-view.vue'
import generalInfoView from '../views/general-info-view.vue'
import historyView from '../views/history-view.vue'
import pollsView from '../views/polls-view.vue'
import statisticsView from '../views/statistics-view.vue'
import dangerZoneView from '../views/danger-zone-view.vue'

export interface UsersDetailPageProps {
  tabId: UserDetailTab
  userId: string
}

defineProps<UsersDetailPageProps>()
</script>

<style scoped lang="sass">
.users-detail-page
  &__sidebar
    display: flex
    flex-direction: column
    align-items: center
    gap: 1em
    text-align: center

    &__avatar
      font-size: 250px
</style>
