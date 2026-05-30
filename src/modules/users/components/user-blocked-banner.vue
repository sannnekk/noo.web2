<template>
  <div
    v-if="user.isBlocked"
    class="user-blocked-banner"
  >
    <noo-error-block
      centered
      no-margin
    >
      Пользователь заблокирован и не может пользоваться платформой.
    </noo-error-block>
    <noo-button
      v-if="can(UsersPermissions.blockUser, { target: user })"
      class="user-blocked-banner__action"
      variant="secondary"
      size="small"
      :is-loading="userDetailStore.unblock.isLoading"
      @click="isConfirmOpen = true"
    >
      Разблокировать
    </noo-button>
    <noo-sure-modal
      v-model:is-open="isConfirmOpen"
      @confirm="userDetailStore.unblock.execute()"
    >
      <template #title>
        <noo-title :size="2">Разблокировать пользователя?</noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          Пользователь снова сможет войти в аккаунт и пользоваться платформой.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Разблокировать </template>
    </noo-sure-modal>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import type { UserEntity } from '../api/user.types'
import { UsersPermissions, useUsersPermissions } from '../permissions'
import { useUserDetailStore } from '../stores/user-detail.store'

interface Props {
  user: UserEntity
}

defineProps<Props>()

const userDetailStore = useUserDetailStore()
const { can } = useUsersPermissions()

const isConfirmOpen = shallowRef<boolean>(false)
</script>

<style scoped lang="sass">
.user-blocked-banner
  display: flex
  flex-direction: column
  align-items: stretch
  gap: 0.5em
  width: 100%
  background-color: var(--light)
  padding: 1em
  border-radius: var(--border-radius)

  &__action
    align-self: center
</style>
