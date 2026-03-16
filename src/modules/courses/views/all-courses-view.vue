<template>
  <noo-card-search-view
    v-model:search="search.search.value"
    v-model:page="search.page.value"
    :items="search.data.value"
    :total-count="search.total.value"
    :is-loading="search.isLoading.value"
    :limit="25"
    :per-row="3"
  >
    <template #actions>
      <noo-button
        v-if="canCreateCourse"
        :to="{ name: 'courses.edit' }"
      >
        Создать курс
      </noo-button>
      <noo-button
        v-if="canVisitCourseShop"
        :to="AppConstants.courseShopLink"
      >
        Наш магазин курсов
      </noo-button>
    </template>
    <template #tile="{ item }">
      <noo-course-card :course="item" />
    </template>
  </noo-card-search-view>
</template>

<script setup lang="ts">
import { useSearch } from '@/core/composables/useSearch'
import { AppConstants } from '@/core/config/constants.config'
import { useAuthStore } from '@/core/stores/auth.store'
import { computed } from 'vue'
import { CourseService } from '../api/course.service'

const authStore = useAuthStore()

const search = useSearch(CourseService.get, { immediate: true })

const canCreateCourse = computed(() =>
  authStore.roleIsOneOf(['teacher', 'admin'])
)

const canVisitCourseShop = computed(() => authStore.roleIsOneOf(['student']))
</script>
