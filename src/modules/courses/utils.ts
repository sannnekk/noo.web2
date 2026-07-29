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

/**
 * Collects the ids of every chapter on the way down to the material, from the root
 * chapter to the one that directly owns it.
 *
 * The tree renders one component per nesting level, so opening a material means opening
 * its whole ancestor chain, not just its immediate parent.
 */
function findChapterIdPathToMaterial(
  chapters: CourseChapterEntity[] | undefined,
  materialId: string
): string[] {
  for (const chapter of chapters ?? []) {
    if ((chapter.materials ?? []).some((m) => m.id === materialId)) {
      return [chapter.id]
    }

    const pathFromSubChapters = findChapterIdPathToMaterial(
      chapter.subChapters,
      materialId
    )

    if (pathFromSubChapters.length > 0) {
      return [chapter.id, ...pathFromSubChapters]
    }
  }

  return []
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
 * Collects every pinned material of the course, in tree order.
 *
 * Pinned materials stay in the tree where they belong; this list is what lets the
 * sidebar surface them again above it without the reader having to expand chapters.
 */
function collectPinnedMaterials(
  chapters: CourseChapterEntity[] | undefined
): CourseMaterialEntity[] {
  const pinned: CourseMaterialEntity[] = []

  for (const chapter of chapters ?? []) {
    pinned.push(...(chapter.materials ?? []).filter((m) => m.isPinned))
    pinned.push(...collectPinnedMaterials(chapter.subChapters))
  }

  return pinned
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
  findChapterIdPathToMaterial,
  collectPinnedMaterials,
  normalizeCoursePatch,
  searchMaterials,
  getLastAttempt
}
