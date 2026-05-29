<template>
  <noo-entity-select
    v-model="model"
    v-model:ids="idsModel"
    :label="label"
    :placeholder="placeholder"
    :readonly="readonly"
    :errors="errors"
    :multiple="multiple"
    :fetch="fetchUsers"
    :resolve="resolveUsers"
    :to-label="toLabel"
  >
    <template #option="{ entity }">
      <span class="noo-user-select__suggestion-title">
        {{ toLabel(entity) }}
      </span>
      <slot
        name="tags"
        :entity="entity"
      >
        <noo-user-role-tag :role="entity.role" />
      </slot>
    </template>
  </noo-entity-select>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import type { UserRole } from '@/core/api/endpoints/auth.types'
import { EqualsFilter, Pagination } from '@/core/utils/pagination.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { UserService } from '@/modules/users/api/user.service'
import type { UserEntity } from '@/modules/users/api/user.types'

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  errors?: ValidationError[]
  multiple?: boolean
  pageSize?: number
  /**
   * Restricts the selectable users to a single role.
   * Defaults to 'student' for backwards compatibility.
   */
  role?: UserRole
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Выберите ученика',
  placeholder: 'Начните вводить имя',
  readonly: false,
  multiple: false,
  pageSize: 10,
  role: 'student'
})

const model = defineModel<UserEntity | UserEntity[] | null>({
  default: null
})

const idsModel = defineModel<string | string[] | null>('ids', {
  default: null
})

function toLabel(user: UserEntity): string {
  return user.name || user.username || user.email || user.id
}

async function fetchUsers(query: string): Promise<UserEntity[]> {
  const pagination = new Pagination(
    1,
    props.pageSize,
    undefined,
    undefined,
    [new EqualsFilter('role', props.role)],
    query.trim() || undefined
  )
  const response = await UserService.get(pagination)

  if (isApiError(response)) {
    throw new Error('Failed to fetch users')
  }

  return (response.data ?? []).filter((user) => user.role === props.role)
}

async function resolveUsers(ids: string[]): Promise<UserEntity[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const response = await UserService.getById(id)

      if (isApiError(response) || !response.data) {
        return null
      }

      if (response.data.role !== props.role) {
        return null
      }

      return response.data
    })
  )

  return results.filter((user): user is UserEntity => Boolean(user))
}
</script>

<style scoped lang="sass">
.noo-user-select
  &__suggestion-title
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 80%
    color: var(--form-text-color)
</style>
