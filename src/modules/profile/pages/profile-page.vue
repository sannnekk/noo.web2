<template>
  <div class="profile-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <div class="profile-page__sidebar">
          <div class="profile-page__sidebar__avatar">
            <noo-user-avatar :name="authStore.userInfo?.name ?? undefined" />
          </div>
          <div class="profile-page__sidebar__info">
            <noo-title :size="3">
              {{ authStore.userInfo?.name }}
            </noo-title>
            <noo-text-block
              size="small"
              dimmed
            >
              {{ authStore.userInfo?.username }}
              <br />
              {{ authStore.userInfo?.email }}
            </noo-text-block>
          </div>
          <div class="profile-page__sidebar__edit-profile">
            <noo-button variant="secondary"> Редактировать профиль </noo-button>
          </div>
        </div>
      </template>
      <template #content>
        <noo-tabs-layout
          use-route-tabs
          route-param-name="tabId"
        >
          <template #tab-title-info>
            <span>Общая информация</span>
          </template>
          <template #tab-info>
            <general-info-view />
          </template>
          <template #tab-title-statistics>
            <span>Статистика</span>
          </template>
          <template #tab-statistics>
            <statistics-view />
          </template>
          <template #tab-title-polls>Опросы</template>
          <template #tab-polls>
            <polls-view />
          </template>
          <template #tab-title-payments>Оплата</template>
          <template #tab-payments>
            <payments-view />
          </template>
        </noo-tabs-layout>
      </template>
    </noo-sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import StatisticsView from '../views/statistics-view.vue'
import PollsView from '../views/polls-view.vue'
import PaymentsView from '../views/payments-view.vue'
import GeneralInfoView from '../views/general-info-view.vue'
import type { ProfilePageTab } from '../types'
import { useAuthStore } from '@/core/stores/auth.store'

export interface ProfilePageProps {
  tabId?: ProfilePageTab
}

defineProps<ProfilePageProps>()

const authStore = useAuthStore()
</script>

<style scoped lang="sass">
.profile-page
  &__sidebar
    display: flex
    flex-direction: column
    align-items: center
    gap: 1em
    text-align: center

    &__avatar
      font-size: 250px
</style>
