<template>
  <div class="users-list-page">
    <noo-sidebar-layout>
      <template #sidebar> 123 </template>
      <template #content>
        <noo-tabs-layout v-model:active-tab="activeTab">
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
        </noo-tabs-layout>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import { useRouteTabs } from '@/core/composables/useRouteTabs'
import type { UserDetailTab } from '../types'
import assignedWorksView from '../views/assigned-works-view.vue'
import calendarView from '../views/calendar-view.vue'
import generalInfoView from '../views/general-info-view.vue'
import historyView from '../views/history-view.vue'
import pollsView from '../views/polls-view.vue'
import statisticsView from '../views/statistics-view.vue'

export interface UsersDetailPageProps {
  tabId: UserDetailTab
  userId: string
}

const props = defineProps<UsersDetailPageProps>()

const { activeTab } = useRouteTabs(props.tabId)
</script>

<style scoped lang="sass"></style>
