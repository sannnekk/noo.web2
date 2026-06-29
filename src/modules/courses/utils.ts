import type { AssignedWorkProgress } from '../assigned-works/api/assigned-work.types'
import type {
  CourseChapterEntity,
  CourseMaterialEntity
} from './api/course.types'

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

function findChapterByMaterialId(
  chapters: CourseChapterEntity[] | undefined,
  materialId: string
): CourseChapterEntity | null {
  for (const chapter of chapters ?? []) {
    if ((chapter.materials ?? []).some((m) => m.id === materialId)) {
      return chapter
    }

    const chapterFromSubChapters = findChapterByMaterialId(
      chapter.subChapters,
      materialId
    )

    if (chapterFromSubChapters) {
      return chapterFromSubChapters
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

/**
 * Flattens a nested chapter tree into a single list where every chapter (root or
 * nested) is a top-level entry and its position is expressed through parentChapterId.
 *
 * The update API contract is flat: this keeps the patch dictionary aligned with the
 * backend's CourseModel.Chapters collection so the merge reuses chapters by id without
 * orphaning descendants, and turns a move into a single parentChapterId change.
 */
function flattenChapters(
  chapters: CourseChapterEntity[],
  parentChapterId: string | null = null
): CourseChapterEntity[] {
  const flattened: CourseChapterEntity[] = []

  for (const chapter of chapters) {
    const { subChapters, ...chapterWithoutSubChapters } = chapter

    flattened.push({
      ...chapterWithoutSubChapters,
      parentChapterId
    } as CourseChapterEntity)

    flattened.push(...flattenChapters(subChapters ?? [], chapter.id ?? null))
  }

  return flattened
}

function normalizeCoursePatch(key: string, value: unknown): unknown {
  if (key === 'chapters' && Array.isArray(value)) {
    const flattened = flattenChapters(value as CourseChapterEntity[])

    return flattened.length === 0 ? null : flattened
  }

  if (key === 'materials' && Array.isArray(value) && value.length === 0) {
    return null
  }

  return value
}

function getLastAttempt(
  progresses: AssignedWorkProgress[]
): AssignedWorkProgress | null {
  if (progresses.length === 0) {
    return null
  }

  return progresses.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )[0]
}

export {
  findMaterial,
  findChapterByMaterialId,
  normalizeCoursePatch,
  searchMaterials,
  getLastAttempt
}
