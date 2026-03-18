import { isApiError } from '@/core/api/api.utils'
import { useEntityDrafts } from '@/core/composables/useEntityDrafts'
import { useGlobalUIStore } from '@/core/stores/global-ui.store'
import { convertToLocal } from '@/core/utils/id.utils'
import {
  JsonPatchUtils,
  type PatchGenerator
} from '@/core/utils/jsonpatch.utils'
import { defineStore } from 'pinia'
import {
  computed,
  ref,
  shallowRef,
  type ComputedRef,
  type Ref,
  type ShallowRef
} from 'vue'
import { useRouter } from 'vue-router'
import { CourseService } from '../api/course.service'
import type {
  CourseEntity,
  CourseMaterialContentEntity
} from '../api/course.types'
import type {
  PossiblyUnsavedChapter,
  PossiblyUnsavedCourse,
  PossiblyUnsavedCourseMaterialContent,
  PossiblyUnsavedMaterial
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
   * The key of the currently edited material.
   */
  currentMaterialContentKey: Ref<string | null>
  /**
   * Indicates whether the current material content is being loaded.
   */
  isCurrentMaterialContentLoading: Ref<boolean>
  /**
   * Content of the currently selected material.
   */
  currentMaterialContent: ComputedRef<PossiblyUnsavedCourseMaterialContent | null>
  /**
   * Indicates whether there are unsaved course or material content changes.
   */
  hasUnsavedChanges: ComputedRef<boolean>
  /**
   * Inits the store with a course ID.
   * If no course ID is provided, it initializes an empty course.
   * Typically used in a navigation guard to prepare the store for editing a course.
   */
  init: (courseId?: string) => Promise<void>
  /**
   * Saves the current course and all changed material contents.
   */
  save: () => Promise<void>
  /**
   * Opens material content for editing by material local key.
   */
  selectMaterial: (materialKey: string) => Promise<void>
  /**
   * Current selected material
   */
  currentMaterial: Ref<PossiblyUnsavedMaterial | null>
  /**
   * Marks material content as removed and tracks it for delete on save.
   */
  markMaterialRemoved: (materialKey: string, contentId: string | null) => void
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
    const currentMaterial = ref<PossiblyUnsavedMaterial | null>(null)
    const isCurrentMaterialContentLoading = ref(false)
    const deletedMaterialContentIds = ref<string[]>([])
    const materialContentDrafts =
      useEntityDrafts<PossiblyUnsavedCourseMaterialContent>()

    const currentMaterialContent = computed(() => {
      const key = currentMaterialContentKey.value

      if (!key) {
        return null
      }

      return materialContentDrafts.getDraft(key)?.entity ?? null
    })

    const hasUnsavedChanges = computed(() => {
      const hasCourseChanges =
        (coursePatchGenerator.value?.countChanges() ?? 0) > 0

      return (
        hasCourseChanges ||
        materialContentDrafts.hasAnyChanges.value ||
        deletedMaterialContentIds.value.length > 0
      )
    })

    function resetMaterialContentState(): void {
      currentMaterialContentKey.value = null
      isCurrentMaterialContentLoading.value = false
      deletedMaterialContentIds.value = []
      materialContentDrafts.clear()
    }

    function findMaterialByKey(
      chapters: PossiblyUnsavedChapter[] | undefined,
      materialKey: string
    ): PossiblyUnsavedMaterial | null {
      for (const chapter of chapters ?? []) {
        const material = (chapter.materials ?? []).find(
          (_material) => _material._key === materialKey
        )

        if (material) {
          return material
        }

        const subChapterMaterial = findMaterialByKey(
          chapter.subChapters,
          materialKey
        )

        if (subChapterMaterial) {
          return subChapterMaterial
        }
      }

      return null
    }

    function pushDeletedMaterialContentId(contentId: string): void {
      if (!deletedMaterialContentIds.value.includes(contentId)) {
        deletedMaterialContentIds.value.push(contentId)
      }
    }

    function removeDeletedMaterialContentId(contentId: string): void {
      deletedMaterialContentIds.value = deletedMaterialContentIds.value.filter(
        (_contentId) => _contentId !== contentId
      )
    }

    async function init(courseId?: string): Promise<void> {
      resetMaterialContentState()

      if (!courseId) {
        mode.value = 'create'
        course.value = CourseService.createDraft()
        coursePatchGenerator.value = null

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
      mode.value = 'view'
    }

    async function selectMaterial(materialKey: string): Promise<void> {
      const material = findMaterialByKey(course.value?.chapters, materialKey)

      if (!material) {
        currentMaterialContentKey.value = null

        return
      }

      currentMaterialContentKey.value = materialKey
      currentMaterial.value = material

      const existingDraft = materialContentDrafts.getDraft(materialKey)

      if (existingDraft) {
        if (existingDraft.entity.id) {
          removeDeletedMaterialContentId(existingDraft.entity.id)
        }

        materialContentDrafts.unmarkDeleted(materialKey)

        return
      }

      if (!material.contentId) {
        materialContentDrafts.setDraft(
          materialKey,
          CourseService.createMaterialContentDraft(),
          {
            isNew: true
          }
        )

        return
      }

      if (!course.value?.id) {
        material.contentId = null
        materialContentDrafts.setDraft(
          materialKey,
          CourseService.createMaterialContentDraft(),
          {
            isNew: true
          }
        )

        return
      }

      isCurrentMaterialContentLoading.value = true

      const response = await CourseService.getMaterialContent(
        course.value.id,
        material.contentId
      )

      isCurrentMaterialContentLoading.value = false

      if (isApiError(response)) {
        if (response.error.statusCode === 404) {
          material.contentId = null
          materialContentDrafts.setDraft(
            materialKey,
            CourseService.createMaterialContentDraft(),
            {
              isNew: true
            }
          )

          return
        }

        uiStore.createApiErrorToast(
          'Не удалось загрузить содержимое материала',
          response.error
        )

        return
      }

      if (!response.data) {
        material.contentId = null
        materialContentDrafts.setDraft(
          materialKey,
          CourseService.createMaterialContentDraft(),
          {
            isNew: true
          }
        )

        return
      }

      const loadedContent = convertToLocal<
        CourseMaterialContentEntity,
        CourseMaterialContentEntity['_entityName'],
        PossiblyUnsavedCourseMaterialContent
      >(response.data)

      materialContentDrafts.setDraft(materialKey, loadedContent)

      if (loadedContent.id) {
        removeDeletedMaterialContentId(loadedContent.id)
      }
    }

    function markMaterialRemoved(
      materialKey: string,
      contentId: string | null
    ): void {
      if (currentMaterialContentKey.value === materialKey) {
        currentMaterialContentKey.value = null
      }

      const draft = materialContentDrafts.getDraft(materialKey)

      if (draft) {
        if (draft.entity.id) {
          pushDeletedMaterialContentId(draft.entity.id)
          materialContentDrafts.markDeleted(materialKey)

          return
        }

        materialContentDrafts.removeDraft(materialKey)

        return
      }

      if (contentId) {
        pushDeletedMaterialContentId(contentId)
      }
    }

    async function saveMaterialContentChanges(): Promise<boolean> {
      if (!course.value) {
        return true
      }

      for (const [materialKey, draft] of Object.entries(
        materialContentDrafts.drafts
      )) {
        if (draft.isDeleted) {
          continue
        }

        const material = findMaterialByKey(course.value.chapters, materialKey)

        if (!material || material.contentId) {
          continue
        }

        const createResponse = await CourseService.createMaterialContent(
          draft.entity
        )

        if (isApiError(createResponse)) {
          uiStore.createApiErrorToast(
            'Не удалось создать содержимое материала',
            createResponse.error
          )

          return false
        }

        if (!createResponse.data) {
          uiStore.createErrorToast('Не удалось создать содержимое материала')

          return false
        }

        material.contentId = createResponse.data.id
        draft.entity.id = createResponse.data.id
        materialContentDrafts.resetDraftBaseline(materialKey)
      }

      for (const [materialKey, draft] of Object.entries(
        materialContentDrafts.drafts
      )) {
        if (draft.isDeleted) {
          continue
        }

        const material = findMaterialByKey(course.value.chapters, materialKey)

        if (!material?.contentId) {
          continue
        }

        const patch = draft.patchGenerator.generate()

        if (patch.length === 0) {
          continue
        }

        const updateResponse = await CourseService.updateMaterialContent(
          material.contentId,
          patch
        )

        if (isApiError(updateResponse)) {
          uiStore.createApiErrorToast(
            'Не удалось обновить содержимое материала',
            updateResponse.error
          )

          return false
        }

        materialContentDrafts.resetDraftBaseline(materialKey)
      }

      for (const contentId of deletedMaterialContentIds.value) {
        const deleteResponse =
          await CourseService.deleteMaterialContent(contentId)

        if (isApiError(deleteResponse)) {
          uiStore.createApiErrorToast(
            'Не удалось удалить содержимое материала',
            deleteResponse.error
          )

          return false
        }
      }

      if (deletedMaterialContentIds.value.length > 0) {
        const deletedContentIds = new Set(deletedMaterialContentIds.value)

        deletedMaterialContentIds.value = []

        for (const [materialKey, draft] of Object.entries(
          materialContentDrafts.drafts
        )) {
          if (draft.entity.id && deletedContentIds.has(draft.entity.id)) {
            materialContentDrafts.removeDraft(materialKey)
          }
        }
      }

      return true
    }

    async function save(): Promise<void> {
      if (!course.value) {
        return
      }

      if (mode.value === 'create') {
        mode.value = 'loading'

        const materialContentSaved = await saveMaterialContentChanges()

        if (!materialContentSaved) {
          mode.value = 'create'

          return
        }

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

        return
      }

      if (mode.value === 'edit') {
        mode.value = 'loading'

        const hadMaterialContentChanges =
          materialContentDrafts.hasAnyChanges.value ||
          deletedMaterialContentIds.value.length > 0
        const materialContentSaved = await saveMaterialContentChanges()

        if (!materialContentSaved) {
          mode.value = 'edit'

          return
        }

        const coursePatch = coursePatchGenerator.value!.generate()

        if (coursePatch.length > 0) {
          // @ts-expect-error ts sees a problem because Course entity has recursive structure in Chapters
          const response = await CourseService.update(
            course.value.id!,
            coursePatch
          )

          if (isApiError(response)) {
            uiStore.createApiErrorToast(
              'Не удалось обновить курс',
              response.error
            )
            mode.value = 'edit'

            return
          }
        } else if (!hadMaterialContentChanges) {
          mode.value = 'edit'

          return
        }

        uiStore.createSuccessToast('Курс успешно обновлен')
        await init(course.value.id)
      }
    }

    return {
      mode,
      course,
      coursePatchGenerator,
      currentMaterialContentKey,
      currentMaterial,
      isCurrentMaterialContentLoading,
      currentMaterialContent,
      hasUnsavedChanges,
      init,
      save,
      selectMaterial,
      markMaterialRemoved
    }
  }
)

export { useCourseEditStore }
