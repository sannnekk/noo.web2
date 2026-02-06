import { isApiError } from '@/core/api/api.utils'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { convertToLocal, uid } from '@/core/utils/id.utils'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { defineStore } from 'pinia'
import { reactive, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { CourseService } from '../api/course.service'
import { type CourseEntity } from '../api/course.types'
import type {
  PossiblyUnsavedCourse,
  PossiblyUnsavedCourseMaterialContent
} from '../types'
import { normalizeCoursePatch } from '../utils'

interface CourseEditStore {
  /**
   * The course being edited.
   */
  course: Ref<PossiblyUnsavedCourse | null>
  /**
   * Mode to tell editing from creating
   */
  mode: ShallowRef<'view' | 'edit' | 'create' | 'error' | 'loading'>
  /**
   * Responsible to generate JSON Patch document for updating the work.
   */
  coursePatchGenerator: ShallowRef<PatchGenerator<PossiblyUnsavedCourse> | null>
  /**
   * The key of the currently edited material content.
   */
  currentMaterialContentKey: Ref<string | null>
  /**
   * An object to store material contents being edited, where _key is used as the key.
   */
  materialContents: Record<string, PossiblyUnsavedCourseMaterialContent>
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
    const router = useRouter()

    const mode = ref<'view' | 'edit' | 'create' | 'error' | 'loading'>('create')
    const course = ref<PossiblyUnsavedCourse | null>(null)
    const coursePatchGenerator =
      shallowRef<PatchGenerator<PossiblyUnsavedCourse> | null>(null)
    const currentMaterialContentKey = ref<string | null>(null)
    const materialContents = reactive<
      Record<string, PossiblyUnsavedCourseMaterialContent>
    >({})

    async function init(courseId?: string): Promise<void> {
      if (!courseId) {
        mode.value = 'create'
        course.value = {
          _entityName: 'Course',
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

      mode.value = 'loading'

      const response = await CourseService.getById(courseId)

      if (isApiError(response)) {
        mode.value = 'error'
        uiStore.createApiErrorToast('Не удалось загрузить курс', response.error)

        return
      }

      if (!response.data) {
        mode.value = 'error'
        uiStore.createErrorToast('Курс не найден')

        return
      }

      const loadedCourse = convertToLocal<
        CourseEntity,
        CourseEntity['_entityName'],
        PossiblyUnsavedCourse
      >(response.data)

      course.value = loadedCourse
      coursePatchGenerator.value = JsonPatchUtils.observe(
        loadedCourse,
        normalizeCoursePatch
      )
      mode.value = 'edit'
    }

    async function save(): Promise<void> {
      if (!course.value) {
        return
      }

      if (mode.value === 'create') {
        mode.value = 'loading'

        const response = await CourseService.create(course.value)

        if (isApiError(response)) {
          uiStore.createApiErrorToast('Не удалось создать курс', response.error)
          mode.value = 'create'

          return
        }

        if (response.data) {
          router.replace({
            name: 'courses.edit',
            params: { courseId: response.data.id }
          })

          uiStore.createSuccessToast('Курс успешно создан')
        }
      } else if (mode.value === 'edit') {
        mode.value = 'loading'

        // @ts-expect-error ts sees a problem because Course entity has recursive structure in Chapters
        const response = await CourseService.update(
          course.value.id!,
          coursePatchGenerator.value!.generate()
        )

        if (isApiError(response)) {
          uiStore.createApiErrorToast(
            'Не удалось обновить курс',
            response.error
          )
          mode.value = 'edit'

          return
        } else {
          uiStore.createSuccessToast('Курс успешно обновлен')
          await init(course.value.id)
        }
      }
    }

    return {
      mode,
      course,
      coursePatchGenerator,
      currentMaterialContentKey,
      materialContents,
      init,
      save
    }
  }
)

export { useCourseEditStore }
