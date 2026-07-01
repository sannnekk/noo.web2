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
      :error="search.error.value"
      :try-again="search.reload"
    >
      <template #above-content>
        <noo-search-filters v-model:filters="search.filters.value">
          <noo-search-range-filter
            v-model:filters="search.filters.value"
            filter-key="createdAt"
            from-label="Дата регистрации с"
            to-label="до"
          />
          <noo-search-enum-filter
            v-model:filters="search.filters.value"
            filter-key="role"
            label="Роль"
            multiple
            :options="userRoles"
          />
        </noo-search-filters>
      </template>
      <template #column-avatar="{ item }">
        <noo-user-avatar
          class="users-list-page__avatar-cell"
          :name="item.name"
          :avatar="item.avatar"
        />
      </template>
      <template #column-name="{ item }">
        <noo-text-block class="users-list-page__name-cell">
          {{ item.isBlocked ? '🚫 ' : '' }}
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
      <template #column-createdAt="{ item }">
        <noo-date
          include-time
          :value="item.createdAt"
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
import { userRoles } from '../constants'

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
  },
  {
    key: 'createdAt',
    title: 'Дата регистрации'
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
