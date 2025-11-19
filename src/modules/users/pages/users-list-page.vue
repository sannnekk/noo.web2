<template>
  <div class="users-list-page">
    <noo-search-view
      v-model:page="search.page.value"
      v-model:search="search.search.value"
      :columns="columns"
      :is-loading="search.isLoading.value"
      :items="search.data.value"
      :total-count="search.total.value"
      :row-link="
        (item) => ({
          name: 'users.detail',
          params: { userId: item.id }
        })
      "
    >
      <template #column-avatar="{ item }">
        <noo-user-avatar
          class="users-list-page__avatar-cell"
          :name="item.name"
          :avatar="
            /* @ts-expect-error not-implemented yet */
            item.avatar
          "
        />
      </template>
      <template #column-name="{ item }">
        <noo-text-block class="users-list-page__name-cell">
          {{ item.name }}
        </noo-text-block>
      </template>
      <template #column-username="{ item }">
        <noo-text-block
          class="users-list-page__username-cell"
          dimmed
        >
          {{ item.username }}
        </noo-text-block>
      </template>
      <template #column-email="{ item }">
        <noo-text-block
          class="users-list-page__email-cell"
          dimmed
        >
          {{ item.email }}
        </noo-text-block>
      </template>
      <template #column-role="{ item }">
        <noo-user-role-tag
          :role="item.role"
          class="users-list-page__role-cell"
        />
      </template>
    </noo-search-view>
  </div>
</template>

<script setup lang="ts">
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import { useSearch } from '@/core/composables/useSearch'
import { UserService } from '../api/user.service'
import type { UserEntity } from '../api/user.types'

const search = useSearch<UserEntity>(UserService.get)

const columns: EntityTableColumnType<UserEntity>[] = [
  {
    key: 'avatar',
    title: '',
    width: '50px'
  },
  {
    key: 'name',
    title: 'Имя'
  },
  {
    key: 'username',
    title: 'Никнейм'
  },
  {
    key: 'email',
    title: 'Email'
  },
  {
    key: 'role',
    title: 'Роль'
  }
]
</script>

<style scoped lang="sass">
.users-list-page
  padding: 0.5em 0

  &__avatar-cell
    font-size: 3em

  &__role-cell
    display: inline-block
</style>
