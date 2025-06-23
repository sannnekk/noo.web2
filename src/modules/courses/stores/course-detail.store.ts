import { useApiRequest, type UseApiRequestReturn } from "@/core/composables/useApiRequest";
import { useGlobalUIStore } from "@/core/stores/global-ui.store";
import { defineStore } from "pinia";
import { shallowRef, type ShallowRef } from "vue";
import type { CourseEntity, CourseMaterialContentEntity, CourseMaterialEntity } from "../api/course.types";
import { courseApiResponse } from "../mock-data/course-api-response";
import { materialContentResponse } from "../mock-data/material-content-api-response";
import { findMaterial } from "../utils";

interface CourseDetailStore {
  course: UseApiRequestReturn<string, CourseEntity>
  currentMaterial: ShallowRef<CourseMaterialEntity | null>
  setCurrentMaterial: (materialId: string) => void
  materialContent: UseApiRequestReturn<void, CourseMaterialContentEntity>
}

const useCourseDetailStore = defineStore("courses:course-detail", (): CourseDetailStore => {
  const uiStore = useGlobalUIStore()

  const currentMaterial = shallowRef<CourseMaterialEntity | null>(null)

  const course = useApiRequest(
    (_id: string) => {
      return Promise.resolve(courseApiResponse)
      /* return CourseService.getById(id) */
    },
    undefined,
    (error) => uiStore.createApiErrorToast("Не удалось загрузить курс", error)
  )

  const materialContent = useApiRequest<void, CourseMaterialContentEntity>(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return materialContentResponse
      /* return CourseService.getMaterialContent(course.data.value!.id, currentMaterial.value!.contentId) */
    },
    undefined,
    (error) => uiStore.createApiErrorToast("Не удалось загрузить материал", error)
  )

  function setCurrentMaterial(materialId: string): void {
    currentMaterial.value = findMaterial(course.data.value?.chapters, materialId)
  }

  return {
    course,
    materialContent,
    currentMaterial,
    setCurrentMaterial
  }
})

export { useCourseDetailStore };

