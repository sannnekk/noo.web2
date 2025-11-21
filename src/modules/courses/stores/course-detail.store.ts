import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'
import { shallowRef, type ShallowRef } from 'vue'
import { CourseService } from '../api/course.service'
import type {
  CourseEntity,
  CourseMaterialContentEntity,
  CourseMaterialEntity
} from '../api/course.types'
import { findMaterial } from '../utils'

interface CourseDetailStore {
  /**
   * The course tree object
   */
  course: UseApiRequestReturn<string, CourseEntity>
  /**
   * The currently selected material
   */
  currentMaterial: ShallowRef<CourseMaterialEntity | null>
  /**
   * Sets the current material by its ID
   */
  setCurrentMaterial: (materialId: string) => void
  /**
   * The content of the currently selected material
   */
  materialContent: UseApiRequestReturn<void, CourseMaterialContentEntity>
}

const useCourseDetailStore = defineStore(
  'courses:course-detail',
  (): CourseDetailStore => {
    const uiStore = useGlobalUIStore()

    const currentMaterial = shallowRef<CourseMaterialEntity | null>(null)

    const course = useApiRequest(CourseService.getById, undefined, (error) =>
      uiStore.createApiErrorToast('Не удалось загрузить курс', error)
    )

    const materialContent = useApiRequest<void, CourseMaterialContentEntity>(
      async () =>
        CourseService.getMaterialContent(
          course.data.value!.id,
          currentMaterial.value!.contentId
        ),
      undefined,
      (error) =>
        uiStore.createApiErrorToast('Не удалось загрузить материал', error)
    )

    function setCurrentMaterial(materialId: string): void {
      currentMaterial.value = findMaterial(
        course.data.value?.chapters,
        materialId
      )
    }

    return {
      course,
      materialContent,
      currentMaterial,
      setCurrentMaterial
    }
  }
)

export { useCourseDetailStore }
