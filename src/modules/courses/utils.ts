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

function normalizeCoursePatch(key: string, value: unknown): unknown {
  if (key === 'chapters' && Array.isArray(value) && value.length === 0) {
    return null
  }

  if (key === 'subChapters' && Array.isArray(value) && value.length === 0) {
    return null
  }

  if (key === 'materials' && Array.isArray(value) && value.length === 0) {
    return null
  }

  return value
}

export { findMaterial, normalizeCoursePatch, searchMaterials }
