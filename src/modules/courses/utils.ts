import { uid } from '@/core/utils/id.utils'
import type {
  CourseChapterEntity,
  CourseEntity,
  CourseMaterialEntity
} from './api/course.types'
import type {
  PossiblyUnsavedChapter,
  PossiblyUnsavedCourse,
  PossiblyUnsavedMaterial
} from './types'

function findMaterial(
  chapters: CourseChapterEntity[] | undefined,
  materialId: string
): CourseMaterialEntity | null {
  for (const chapter of chapters ?? []) {
    const material = (chapter.materials ?? []).find((m) => m.id === materialId)

    if (material) {
      return material
    }

    const materialFromSubChapters = findMaterial(
      chapter.subChapters,
      materialId
    )

    if (materialFromSubChapters) {
      return materialFromSubChapters
    }
  }

  return null
}

function searchMaterials(
  chapters: CourseChapterEntity[] | undefined,
  search: string,
  maxResults = 5
): CourseMaterialEntity[] {
  const results: CourseMaterialEntity[] = []

  for (const chapter of chapters ?? []) {
    if (results.length <= maxResults) {
      results.push(
        ...(chapter.materials ?? []).filter((material) =>
          material.title.toLowerCase().includes(search.toLowerCase())
        )
      )

      results.push(...searchMaterials(chapter.subChapters, search))
    }
  }

  return results
}

function courseToPossiblyUnsaved(entity: CourseEntity): PossiblyUnsavedCourse {
  return {
    ...entity,
    _key: uid(),
    chapters: (entity.chapters ?? []).map((chapter) =>
      chapterToPossiblyUnsaved(chapter)
    )
  }
}

function chapterToPossiblyUnsaved(
  entity: CourseChapterEntity
): PossiblyUnsavedChapter {
  return {
    ...entity,
    _key: uid(),
    materials: (entity.materials ?? []).map((material) =>
      materialToPossiblyUnsaved(material)
    ),
    subChapters: (entity.subChapters ?? []).map((subChapter) =>
      chapterToPossiblyUnsaved(subChapter)
    )
  }
}

function materialToPossiblyUnsaved(
  entity: CourseMaterialEntity
): PossiblyUnsavedMaterial {
  return {
    ...entity,
    _key: uid()
  }
}

export { courseToPossiblyUnsaved, findMaterial, searchMaterials }
