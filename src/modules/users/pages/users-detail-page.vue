<template>
  <div class="users-detail-page">
    <noo-sidebar-layout collapsible>
      <template #sidebar>
        <div class="users-detail-page__sidebar">
          <noo-back-button :route="{ name: 'users.list' }">
            Назад к списку пользователей
          </noo-back-button>
          <template v-if="user">
            <div class="users-detail-page__sidebar__avatar">
              <noo-user-avatar :name="user.name" />
            </div>
            <div class="users-detail-page__sidebar__info">
              <noo-title :size="3">
                {{ user.name }}
              </noo-title>
              <noo-user-role-tag :role="user.role" />
              <noo-text-block
                size="small"
                dimmed
              >
                Email:
                <b>{{ user.email }}</b>
                <br />
                Никнейм:
                <b>{{ user.username }}</b>
              </noo-text-block>
            </div>
            <user-blocked-banner :user="user" />
            <user-unverified-banner :user="user" />
          </template>
          <div
            v-else-if="userDetailStore.user.isLoading"
            class="users-detail-page__sidebar__loading"
          >
            <noo-loader-icon contrast />
            <noo-text-block
              size="small"
              dimmed
            >
              Загрузка пользователя...
            </noo-text-block>
          </div>
          <noo-error-block
            v-else
            centered
            no-margin
            :try-again="() => userDetailStore.init(userId)"
          >
            <noo-title :size="5">Не удалось загрузить пользователя</noo-title>
          </noo-error-block>
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
          <template
            v-if="can(UsersPermissions.viewDangerZone, { target: user })"
            #tab-title-danger-zone
          >
            Опасная зона
          </template>
          <template
            v-if="can(UsersPermissions.viewDangerZone, { target: user })"
            #tab-danger-zone
          >
            <danger-zone-view />
          </template>
        </noo-tabs-layout>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import UserBlockedBanner from '../components/user-blocked-banner.vue'
import UserUnverifiedBanner from '../components/user-unverified-banner.vue'
import { UsersPermissions, useUsersPermissions } from '../permissions'
import { useUserDetailStore } from '../stores/user-detail.store'
import type { UserDetailTab } from '../types'
import assignedWorksView from '../views/assigned-works-view.vue'
import calendarView from '../views/calendar-view.vue'
import dangerZoneView from '../views/danger-zone-view.vue'
import generalInfoView from '../views/general-info-view.vue'
import historyView from '../views/history-view.vue'
import pollsView from '../views/polls-view.vue'
import statisticsView from '../views/statistics-view.vue'

export interface UsersDetailPageProps {
  tabId: UserDetailTab
  userId: string
}

const props = defineProps<UsersDetailPageProps>()

const userDetailStore = useUserDetailStore()
const { can } = useUsersPermissions()

const user = computed(() => userDetailStore.user.data)

watch(
  () => props.userId,
  (userId) => userDetailStore.init(userId)
)
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

    &__info
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.5em

    &__loading
      display: flex
      flex-direction: column
      align-items: center
      gap: 0.5em
      font-size: 2em
</style>
