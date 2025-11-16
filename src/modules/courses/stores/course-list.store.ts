import { useSearch } from '@/core/composables/useSearch'
import { defineStore } from 'pinia'
import type { CourseEntity } from '../api/course.types'
import { courses } from '../mock-data/courses'

interface CourseListStore {
  allSearch: ReturnType<typeof useSearch<CourseEntity>>
}

export const useCourseListStore = defineStore(
  'courses:course-list',
  (): CourseListStore => {
    const allSearch = useSearch(
      () => {
        return Promise.resolve({
          data: courses,
          meta: { total: courses.length }
        })
        /* return CourseService.get() */
      },
      { immediate: false }
    )

    return {
      allSearch
    }
  }
)
