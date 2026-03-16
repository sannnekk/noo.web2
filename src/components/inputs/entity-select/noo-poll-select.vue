<template>
  <noo-entity-select
    v-model="model"
    v-model:ids="idsModel"
    :label="label"
    :placeholder="placeholderValue"
    :readonly="readonly"
    :errors="errors"
    :multiple="multiple"
    :fetch="fetchPolls"
    :resolve="resolvePolls"
    :to-label="(p: PollEntity) => p.title"
  >
    <template #option="{ entity }">
      <span class="noo-poll-select__suggestion-title">
        {{ entity.title }}
      </span>
      <noo-active-tag :active="entity.isActive" />
    </template>
  </noo-entity-select>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { Pagination } from '@/core/utils/pagination.utils'
import { PollService } from '@/modules/polls/api/poll.service'
import type { PollEntity } from '@/modules/polls/api/poll.types'
import { computed } from 'vue'

interface Props {
  label?: string
  placeholder?: string
  readonly?: boolean
  errors?: ValidationError[]
  multiple?: boolean
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Выберите опрос',
  placeholder: 'Начните вводить название',
  readonly: false,
  multiple: false,
  pageSize: 10
})

const model = defineModel<PollEntity | PollEntity[] | null>({
  default: null
})

const idsModel = defineModel<string | string[] | null>('ids', {
  default: null
})

const placeholderValue = computed(() => {
  if (props.readonly && !model.value) {
    return 'Опрос не выбран'
  }

  return props.placeholder
})

async function fetchPolls(query: string): Promise<PollEntity[]> {
  const pagination = new Pagination(
    1,
    10,
    undefined,
    undefined,
    [],
    query.trim() || undefined
  )
  const response = await PollService.get(pagination)

  if (isApiError(response)) {
    throw new Error('Failed to fetch polls')
  }

  return response.data ?? []
}

async function resolvePolls(ids: string[]): Promise<PollEntity[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const response = await PollService.getById(id)

      if (isApiError(response) || !response.data) {
        return null
      }

      return response.data
    })
  )

  return results.filter((p): p is PollEntity => Boolean(p))
}
</script>

<style scoped lang="sass">
.noo-poll-select
  &__suggestion-title
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 70%
    color: var(--form-text-color)
</style>
