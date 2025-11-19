<template>
  <noo-card-search-view
    v-model:search="search.search.value"
    v-model:page="search.page.value"
    :items="search.data.value"
    :total-count="search.total.value"
    :is-loading="search.isLoading.value"
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
      <noo-button
        v-if="/* authStore.roleIsOneOf(['student']) */ true"
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
import { courses } from '../mock-data/courses'

const search = useSearch(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      data: courses,
      meta: { total: courses.length }
    }
    /* return CourseService.get() */
  },
  { immediate: true }
)
</script>
