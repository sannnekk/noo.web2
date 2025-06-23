import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { uid } from '@/core/utils/id.utils'
import { defineStore } from 'pinia'
import { ref, type Ref, type ShallowRef } from 'vue'
import { CourseService } from '../api/course.service'
import type { PossiblyUnsavedCourse, PossiblyUnsavedMaterial } from '../types'
import { courseToPossiblyUnsaved } from '../utils'

interface CourseEditStore {
  /**
   * The course being edited.
   */
  course: Ref<PossiblyUnsavedCourse | null>
  /**
   * The material being edited.
   */
  material: Ref<PossiblyUnsavedMaterial | null>
  /**
   * Mode to tell editing from creating
   */
  mode: ShallowRef<'edit' | 'create'>
  /**
   * Inits the store with a course ID.
   * If no course ID is provided, it initializes an empty course.
   * Typically used in a navigation guard to prepare the store for editing a course.
   */
  init: (courseId?: string) => Promise<void>
  /**
   * Saves the current course and material.
   * If the course is new, it creates a new course.
   * If the course already exists, it updates the existing course.
   */
  save: () => Promise<void>
}

const useCourseEditStore = defineStore(
  'courses:course-edit',
  (): CourseEditStore => {
    const uiStore = useGlobalUIStore()

    const mode = ref<'edit' | 'create'>('create')

    const course = ref<PossiblyUnsavedCourse | null>(null)
    const material = ref<PossiblyUnsavedMaterial | null>(null)

    async function init(courseId?: string): Promise<void> {
      if (!courseId) {
        mode.value = 'create'
        course.value = {
          _key: uid(),
          name: 'Новый курс',
          description: null,
          startDate: new Date(),
          endDate: new Date(),
          subjectId: null,
          thumbnailId: null,
          chapters: []
        }

        return
      }

      uiStore.setLoading(true)

      const response = await CourseService.getById(courseId)

      if (response.error) {
        uiStore.setLoading(false)
        uiStore.createApiErrorToast('Не удалось загрузить курс', response.error)

        return
      }

      course.value = courseToPossiblyUnsaved(response.data)
    }

    async function save(): Promise<void> {
      if (!course.value) {
        return
      }

      uiStore.setLoading(true)

      const response =
        mode.value === 'create'
          ? await CourseService.create(course.value)
          : await CourseService.update(course.value.id, course.value)

      if (response.error) {
        uiStore.setLoading(false)
        uiStore.createApiErrorToast(
          mode.value === 'create'
            ? 'Не удалось создать курс'
            : 'Не удалось обновить курс',
          response.error
        )

        return
      }

      course.value = courseToPossiblyUnsaved(response.data)
      uiStore.setLoading(false)
      uiStore.createSuccessToast('Курс успешно сохранен')
    }

    return {
      mode,
      course,
      material,
      init,
      save
    }
  }
)

export { useCourseEditStore }
