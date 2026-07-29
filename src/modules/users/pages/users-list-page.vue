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
        <noo-text-block no-margin>
          {{ item.isBlocked ? '🚫 ' : '' }}
          {{ item.name }}
        </noo-text-block>
        <noo-text-block
          v-if="item.role === 'student'"
          dimmed
          size="small"
          no-margin
        >
          {{ item.mentors?.length ? 'Кураторы:' : 'Нет кураторов' }}
        </noo-text-block>
        <div
          v-if="item.role === 'student'"
          class="users-list-page__mentors"
        >
          <div
            v-for="mentor in item.mentors"
            :key="mentor.id"
            class="users-list-page__mentors__mentor"
            :title="`Куратор по предмету ${mentor.subjectName}`"
          >
            <noo-color-badge :color="mentor.subjectColor ?? undefined" />
            <noo-inline-link
              :to="{ name: 'users.detail', params: { userId: mentor.id } }"
            >
              {{ mentor.name }}
            </noo-inline-link>
          </div>
        </div>
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

  &__mentors
    display: flex
    flex-direction: column
    gap: 0.15em
    margin-top: 0.15em

    &__mentor
      display: flex
      align-items: center
      gap: 0.4em
      font-size: 0.85em

      &__subject
        color: var(--text-light)
</style>
