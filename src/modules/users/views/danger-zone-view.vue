<template>
  <div
    v-if="user"
    class="danger-zone-view"
  >
    <noo-section
      v-if="canBlock"
      :title="
        user.isBlocked
          ? 'Разблокировка пользователя'
          : 'Блокировка пользователя'
      "
      :description="
        user.isBlocked
          ? 'Пользователь сейчас заблокирован и не может пользоваться платформой. Снимите блокировку, чтобы вернуть ему доступ.'
          : 'Заблокированный пользователь не сможет войти в аккаунт и пользоваться платформой, пока его не разблокируют.'
      "
    >
      <noo-button
        :variant="user.isBlocked ? 'secondary' : 'danger'"
        size="medium"
        :is-loading="
          userDetailStore.block.isLoading || userDetailStore.unblock.isLoading
        "
        @click="modals.block.isOpen.value = true"
      >
        {{ user.isBlocked ? 'Разблокировать' : 'Заблокировать' }}
      </noo-button>
    </noo-section>

    <noo-section
      v-if="canChangeRole"
      title="Смена роли"
      description="Изменение роли влияет на доступные пользователю разделы и действия. Будьте внимательны."
    >
      <div class="danger-zone-view__role">
        <noo-select-input
          v-model="selectedRole"
          label="Роль"
          :options="roleOptions"
        />
        <noo-button
          variant="secondary"
          size="medium"
          :disabled="!isRoleChanged"
          :is-loading="userDetailStore.changeRole.isLoading"
          @click="modals.changeRole.isOpen.value = true"
        >
          Сменить роль
        </noo-button>
      </div>
    </noo-section>

    <noo-section
      v-if="canDelete"
      title="Удаление аккаунта"
      description="Удаление аккаунта приведёт к безвозвратной потере всех связанных с ним данных. Это действие нельзя отменить."
    >
      <noo-button
        variant="danger-inline"
        size="medium"
        :is-loading="userDetailStore.deleteUser.isLoading"
        @click="modals.delete.isOpen.value = true"
      >
        Удалить аккаунт
      </noo-button>
    </noo-section>

    <noo-text-block
      v-if="!canBlock && !canChangeRole && !canDelete"
      dimmed
    >
      У вас нет прав на действия в этой зоне.
    </noo-text-block>
  </div>

  <noo-sure-modal
    v-model:is-open="modals.block.isOpen.value"
    @confirm="
      user?.isBlocked
        ? userDetailStore.unblock.execute()
        : userDetailStore.block.execute()
    "
  >
    <template #title>
      <noo-title :size="2">
        {{
          user?.isBlocked
            ? 'Разблокировать пользователя?'
            : 'Заблокировать пользователя?'
        }}
      </noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        {{
          user?.isBlocked
            ? 'Пользователь снова сможет войти в аккаунт и пользоваться сервисом.'
            : 'Пользователь не сможет войти в аккаунт, пока его не разблокируют.'
        }}
      </noo-text-block>
    </template>
    <template #confirm-action-text>
      {{ user?.isBlocked ? 'Разблокировать' : 'Заблокировать' }}
    </template>
  </noo-sure-modal>

  <noo-sure-modal
    v-model:is-open="modals.changeRole.isOpen.value"
    @confirm="confirmChangeRole"
  >
    <template #title>
      <noo-title :size="2">Сменить роль пользователя?</noo-title>
    </template>
    <template #content>
      <noo-text-block dimmed>
        Текущая роль будет заменена на «{{ selectedRoleLabel }}». Доступные
        пользователю разделы и действия изменятся.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Сменить </template>
  </noo-sure-modal>

  <noo-sure-modal
    v-model:is-open="modals.delete.isOpen.value"
    @confirm="userDetailStore.deleteUser.execute()"
  >
    <template #title>
      <noo-title :size="2">Удалить пользователя?</noo-title>
    </template>
    <template #content>
      <noo-warning-block> Это действие нельзя отменить. </noo-warning-block>
      <noo-text-block dimmed>
        Все данные, связанные с этим пользователем, будут безвозвратно удалены.
      </noo-text-block>
    </template>
    <template #confirm-action-text> Удалить </template>
  </noo-sure-modal>
</template>

<script setup lang="ts">
import type { UserRole } from '@/core/api/endpoints/auth.types'
import { computed, shallowRef, watch } from 'vue'
import { userRoles } from '../constants'
import { UsersPermissions, useUsersPermissions } from '../permissions'
import { useUserDetailStore } from '../stores/user-detail.store'

const userDetailStore = useUserDetailStore()
const { can } = useUsersPermissions()

const user = computed(() => userDetailStore.user.data)

const canBlock = can(UsersPermissions.blockUser)
const canChangeRole = can(UsersPermissions.changeUserRole)
const canDelete = can(UsersPermissions.deleteUser)

const selectedRole = shallowRef<UserRole | null>(user.value?.role ?? null)

watch(
  () => user.value?.role,
  (role) => {
    selectedRole.value = role ?? null
  }
)

const roleOptions = userRoles.map((role) => ({
  label: role.label,
  value: role.value as UserRole | null
}))

const selectedRoleLabel = computed(
  () => userRoles.find((role) => role.value === selectedRole.value)?.label ?? ''
)

const isRoleChanged = computed(
  () => selectedRole.value !== null && selectedRole.value !== user.value?.role
)

const modals = {
  block: { isOpen: shallowRef(false) },
  changeRole: { isOpen: shallowRef(false) },
  delete: { isOpen: shallowRef(false) }
}

function confirmChangeRole(): void {
  if (selectedRole.value && isRoleChanged.value) {
    userDetailStore.changeRole.execute(selectedRole.value)
  }
}
</script>

<style scoped lang="sass">
.danger-zone-view
  display: flex
  flex-direction: column
  gap: 2em

  &__role
    display: flex
    flex-direction: column
    align-items: flex-start
    gap: 0.5em
    max-width: 400px
</style>
