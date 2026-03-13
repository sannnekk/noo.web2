<template>
  <noo-entity-select
    v-model="model"
    v-model:ids="idsModel"
    :label="label"
    :placeholder="placeholder"
    :readonly="readonly"
    :errors="errors"
    :multiple="multiple"
    :fetch="fetchWorks"
    :resolve="resolveWorks"
    :to-label="(w: WorkEntity) => w.title"
  >
    <template #option="{ entity }">
      <span class="noo-work-select__suggestion-title">
        {{ entity.title }}
      </span>
      <noo-work-type-tag :type="entity.type" />
    </template>
  </noo-entity-select>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { Pagination } from '@/core/utils/pagination.utils'
import { WorkService } from '@/modules/works/api/work.service'
import type { WorkEntity } from '@/modules/works/api/work.types'

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  errors?: ValidationError[]
  multiple?: boolean
  pageSize?: number
}

withDefaults(defineProps<Props>(), {
  label: 'Выберите работу',
  placeholder: 'Начните вводить название',
  readonly: false,
  multiple: false,
  pageSize: 10
})

const model = defineModel<WorkEntity | WorkEntity[] | null>({
  default: null
})

const idsModel = defineModel<string | string[] | null>('ids', {
  default: null
})

async function fetchWorks(query: string): Promise<WorkEntity[]> {
  const pagination = new Pagination(
    1,
    10,
    undefined,
    undefined,
    [],
    query.trim() || undefined
  )
  const response = await WorkService.get(pagination)

  if (isApiError(response)) {
    throw new Error('Failed to fetch works')
  }

  return response.data ?? []
}

async function resolveWorks(ids: string[]): Promise<WorkEntity[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const response = await WorkService.getById(id)

      if (isApiError(response) || !response.data) {
        return null
      }

      return response.data
    })
  )

  return results.filter((w): w is WorkEntity => Boolean(w))
}
</script>

<style scoped lang="sass">
.noo-work-select
  &__suggestion-title
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 80%
    color: var(--form-text-color)
</style>
