<template>
  <div class="course-list-view">
    <div class="course-list-view__head" />
    <div class="course-list-view__content">
      <noo-card-search-view
        v-model:search="searchModel"
        v-model:page="pageModel"
        :items="courses"
        :total-count="totalCount"
        :is-loading="isLoading"
        :limit="25"
        :tiles-per-row="3"
      >
        <template #actions>
          <noo-button
            v-if="/* authStore.roleIsOneOf(['teacher', 'admin']) */ true"
            :to="{ name: 'courses.edit' }"
          >
            Создать курс
          </noo-button>
          <noo-button :to="AppConstants.courseShopLink">
            Наш магазин курсов
          </noo-button>
        </template>
        <template #tile="{ item }">
          <noo-course-card :course="item" />
        </template>
      </noo-card-search-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppConstants } from '@/core/config/constants.config'
import { useAuthStore } from '@/core/stores/auth.store'
import type { CourseEntity } from '../api/course.types'

interface Props {
  courses: CourseEntity[]
  totalCount: number
  isLoading?: boolean
}

defineProps<Props>()

const searchModel = defineModel<string>('search', {
  default: ''
})

const pageModel = defineModel<number>('page', {
  default: 1
})

const authStore = useAuthStore()
</script>

<style scoped lang="sass"></style>
