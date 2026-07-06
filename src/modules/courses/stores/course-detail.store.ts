import { isApiError } from '@/core/api/api.utils'
import {
  useApiRequest,
  type UseApiRequestReturn
} from '@/core/composables/useApiRequest'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { defineStore } from 'pinia'
import { reactive, shallowRef, type ShallowRef } from 'vue'
import { CourseService } from '../api/course.service'
import type {
  CourseEntity,
  CourseMaterialContentEntity,
  CourseMaterialEntity,
  CourseMaterialReaction
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
  /**
   * Toggles the current student's reaction on the currently selected material
   */
  toggleReaction: (reaction: CourseMaterialReaction) => Promise<void>
}

const useCourseDetailStore = defineStore(
  'courses:course-detail',
  (): CourseDetailStore => {
    const uiStore = useGlobalUIStore()

    const currentMaterial = shallowRef<CourseMaterialEntity | null>(null)

    const course: UseApiRequestReturn<string, CourseEntity> = useApiRequest(
      CourseService.getById,
      (response) => {
        course.data.value = reactive(response.data)
      },
      (error) => uiStore.createApiErrorToast('Не удалось загрузить курс', error)
    )

    const materialContent = useApiRequest<void, CourseMaterialContentEntity>(
      async () =>
        CourseService.getMaterialContent(
          course.data.value!.id,
          currentMaterial.value!.contentId!
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

    function setCurrentMaterialReaction(
      reaction: CourseMaterialReaction | null
    ): void {
      if (!currentMaterial.value) {
        return
      }

      currentMaterial.value.myReaction = reaction
    }

    async function toggleReaction(
      reaction: CourseMaterialReaction
    ): Promise<void> {
      const courseId = course.data.value?.id
      const material = currentMaterial.value

      if (!courseId || !material) {
        return
      }

      const previousReaction = material.myReaction ?? null

      setCurrentMaterialReaction(
        previousReaction === reaction ? null : reaction
      )

      const response = await CourseService.toggleMaterialReaction(
        courseId,
        material.id,
        reaction
      )

      if (isApiError(response)) {
        setCurrentMaterialReaction(previousReaction)
        uiStore.createApiErrorToast(
          'Не удалось сохранить реакцию',
          response.error
        )
      }
    }

    return {
      course,
      materialContent,
      currentMaterial,
      setCurrentMaterial,
      toggleReaction
    }
  }
)

export { useCourseDetailStore }
