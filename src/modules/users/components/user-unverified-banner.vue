<template>
  <div
    v-if="!user.isVerified"
    class="user-unverified-banner"
  >
    <noo-warning-block small>
      Пользователь ещё не подтвердил свой email.
    </noo-warning-block>
    <noo-button
      v-if="canVerify"
      class="user-unverified-banner__action"
      variant="secondary"
      size="small"
      :is-loading="userDetailStore.verifyManual.isLoading"
      @click="isConfirmOpen = true"
    >
      Подтвердить вручную
    </noo-button>
    <noo-sure-modal
      v-model:is-open="isConfirmOpen"
      @confirm="userDetailStore.verifyManual.execute()"
    >
      <template #title>
        <noo-title :size="2">Подтвердить пользователя?</noo-title>
      </template>
      <template #content>
        <noo-text-block dimmed>
          Используйте эту опцию, если пользователь не смог подтвердить email
          самостоятельно. После этого он сможет полноценно пользоваться
          платформой.
        </noo-text-block>
      </template>
      <template #confirm-action-text> Подтвердить </template>
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

const canVerify = can(UsersPermissions.verifyUser)
const isConfirmOpen = shallowRef<boolean>(false)
</script>

<style scoped lang="sass">
.user-unverified-banner
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
