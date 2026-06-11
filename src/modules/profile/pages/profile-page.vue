<template>
  <div class="profile-page">
    <noo-sidebar-layout>
      <template #sidebar>
        <div class="profile-page__sidebar">
          <div class="profile-page__sidebar__avatar">
            <noo-user-avatar
              :name="currentUser?.name ?? undefined"
              :avatar="avatar"
              editable
              @edit="isAvatarModalOpen = true"
            />
          </div>
          <div class="profile-page__sidebar__info">
            <noo-title :size="3">
              {{ currentUser?.name }}
            </noo-title>
            <noo-text-block
              size="small"
              dimmed
            >
              {{ currentUser?.username }}
              <br />
              {{ currentUser?.email }}
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
          <template
            v-if="canViewInfo"
            #tab-title-info
          >
            <span>Общая информация</span>
          </template>
          <template
            v-if="canViewInfo"
            #tab-info
          >
            <general-info-view />
          </template>
          <template
            v-if="canViewStatistics"
            #tab-title-statistics
          >
            <span>Статистика</span>
          </template>
          <template
            v-if="canViewStatistics"
            #tab-statistics
          >
            <statistics-view />
          </template>
          <template
            v-if="canViewPolls"
            #tab-title-polls
          >
            Опросы
          </template>
          <template
            v-if="canViewPolls"
            #tab-polls
          >
            <polls-view />
          </template>
          <template
            v-if="canViewPayments"
            #tab-title-payments
          >
            Оплата
          </template>
          <template
            v-if="canViewPayments"
            #tab-payments
          >
            <payments-view />
          </template>
        </noo-tabs-layout>
      </template>
    </noo-sidebar-layout>

    <avatar-edit-modal
      v-if="authStore.userId"
      v-model:is-open="isAvatarModalOpen"
      v-model:avatar="avatar"
      :user-id="authStore.userId"
      :name="currentUser?.name ?? undefined"
    />
  </div>
</template>

<script setup lang="ts">
import StatisticsView from '../views/statistics-view.vue'
import PollsView from '../views/polls-view.vue'
import PaymentsView from '../views/payments-view.vue'
import GeneralInfoView from '../views/general-info-view.vue'
import AvatarEditModal from '../components/avatar-edit-modal.vue'
import type { ProfilePageTab } from '../types'
import type { UserAvatarEntity } from '@/modules/users/api/user.types'
import { useAuthStore } from '@/core/stores/auth.store'
import { ProfilePermissions, useProfilePermissions } from '../permissions'
import { computed, ref, watch } from 'vue'

export interface ProfilePageProps {
  tabId?: ProfilePageTab
}

defineProps<ProfilePageProps>()

const authStore = useAuthStore()
const { can } = useProfilePermissions()

const currentUser = computed(() => authStore.currentUser.data)

const isAvatarModalOpen = ref(false)
const avatar = ref<UserAvatarEntity | null>(null)

// Seed the editable avatar from the loaded user; the edit modal may override it.
watch(
  () => currentUser.value?.avatar,
  (value) => {
    avatar.value = value ?? null
  },
  { immediate: true }
)

const canViewInfo = can(ProfilePermissions.viewInfoTab)
const canViewStatistics = can(ProfilePermissions.viewStatisticsTab)
const canViewPolls = can(ProfilePermissions.viewPollsTab)
const canViewPayments = can(ProfilePermissions.viewPaymentsTab)
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
