<template>
  <noo-entity-select
    v-model="model"
    v-model:ids="idsModel"
    :label="label"
    :placeholder="placeholderValue"
    :readonly="readonly"
    :errors="errors"
    :multiple="multiple"
    :fetch="fetchCourses"
    :resolve="resolveCourses"
    :to-label="(c: CourseEntity) => c.name"
  >
    <template #option="{ entity }">
      <span class="noo-course-select__suggestion-title">
        {{ entity.name }}
      </span>
    </template>
  </noo-entity-select>
</template>

<script setup lang="ts">
import { isApiError } from '@/core/api/api.utils'
import { Pagination } from '@/core/utils/pagination.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { CourseService } from '@/modules/courses/api/course.service'
import type { CourseEntity } from '@/modules/courses/api/course.types'
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
  label: 'Выберите курс',
  placeholder: 'Начните вводить название',
  readonly: false,
  multiple: false,
  pageSize: 10
})

const model = defineModel<CourseEntity | CourseEntity[] | null>({
  default: null
})

const idsModel = defineModel<string | string[] | null>('ids', {
  default: null
})

const placeholderValue = computed(() => {
  if (props.readonly && !model.value) {
    return 'Курс не выбран'
  }

  return props.placeholder
})

async function fetchCourses(query: string): Promise<CourseEntity[]> {
  const pagination = new Pagination(
    1,
    props.pageSize,
    undefined,
    undefined,
    [],
    query.trim() || undefined
  )
  const response = await CourseService.get(pagination)

  if (isApiError(response)) {
    throw new Error('Failed to fetch courses')
  }

  return response.data ?? []
}

async function resolveCourses(ids: string[]): Promise<CourseEntity[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const response = await CourseService.getById(id)

      if (isApiError(response) || !response.data) {
        return null
      }

      return response.data
    })
  )

  return results.filter((c): c is CourseEntity => Boolean(c))
}
</script>

<style scoped lang="sass">
.noo-course-select
  &__suggestion-title
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    max-width: 70%
    color: var(--form-text-color)
</style>
