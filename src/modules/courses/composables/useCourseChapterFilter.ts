import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import type {
  CourseChapterEntity,
  CourseMaterialEntity
} from '../api/course.types'
import type { PossiblyUnsavedChapter, PossiblyUnsavedMaterial } from '../types'

type ChapterLike = CourseChapterEntity | PossiblyUnsavedChapter
type MaterialLike = CourseMaterialEntity | PossiblyUnsavedMaterial

interface MatchItem {
  type: 'chapter' | 'material'
  key: string
}

interface UseCourseChapterFilterOptions<T extends ChapterLike> {
  chapters: Ref<T[] | undefined | null> | (() => T[] | undefined | null)
  minSearchLength?: number
  onSelect?: (item: MatchItem) => void
}

interface UseCourseChapterFilterReturn<T extends ChapterLike> {
  search: ShallowRef<string>
  filteredChapters: Ref<T[]>
  isFiltering: Ref<boolean>
  highlightedKey: ShallowRef<string | null>
  highlightedItem: Ref<MatchItem | null>
  navigateNext: () => void
  navigatePrev: () => void
  selectHighlighted: () => void
  onSearchKeydown: (event: KeyboardEvent) => void
}

function useCourseChapterFilter<T extends ChapterLike>(
  options: UseCourseChapterFilterOptions<T>
): UseCourseChapterFilterReturn<T> {
  const { chapters, minSearchLength = 2, onSelect } = options
  const search = shallowRef('')
  const highlightedIndex = shallowRef(0)
  const highlightedKey = shallowRef<string | null>(null)

  const chaptersValue = computed(() => {
    const value = typeof chapters === 'function' ? chapters() : chapters.value

    return value ?? []
  })

  const isFiltering = computed(() => search.value.length >= minSearchLength)

  const filteredChapters = computed(() => {
    if (!isFiltering.value) {
      return chaptersValue.value
    }

    return filterChapters(chaptersValue.value, search.value.toLowerCase())
  })

  const matchingItems = computed<MatchItem[]>(() => {
    if (!isFiltering.value) {
      return []
    }

    return collectMatches(filteredChapters.value, search.value.toLowerCase())
  })

  const highlightedItem = computed<MatchItem | null>(() => {
    const items = matchingItems.value

    if (items.length === 0) {
      return null
    }

    const index = Math.min(highlightedIndex.value, items.length - 1)

    return items[index] ?? null
  })

  watch(
    [matchingItems, highlightedIndex],
    () => {
      const items = matchingItems.value

      if (items.length === 0) {
        highlightedKey.value = null

        return
      }

      const index = Math.min(highlightedIndex.value, items.length - 1)

      highlightedKey.value = items[index]?.key ?? null
    },
    { immediate: true }
  )

  watch(search, () => {
    highlightedIndex.value = 0
  })

  function navigateNext(): void {
    if (matchingItems.value.length === 0) {
      return
    }

    highlightedIndex.value =
      (highlightedIndex.value + 1) % matchingItems.value.length
  }

  function navigatePrev(): void {
    if (matchingItems.value.length === 0) {
      return
    }

    highlightedIndex.value =
      (highlightedIndex.value - 1 + matchingItems.value.length) %
      matchingItems.value.length
  }

  function selectHighlighted(): void {
    const item = highlightedItem.value

    if (item && onSelect) {
      onSelect(item)
    }
  }

  function onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      navigateNext()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      navigatePrev()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      selectHighlighted()
    }
  }

  return {
    search,
    filteredChapters,
    isFiltering,
    highlightedKey,
    highlightedItem,
    navigateNext,
    navigatePrev,
    selectHighlighted,
    onSearchKeydown
  }
}

function collectMatches<T extends ChapterLike>(
  chapters: T[],
  searchLower: string
): MatchItem[] {
  const matches: MatchItem[] = []

  for (const chapter of chapters) {
    collectChapterMatches(chapter, searchLower, matches)
  }

  return matches
}

function collectChapterMatches<T extends ChapterLike>(
  chapter: T,
  searchLower: string,
  matches: MatchItem[]
): void {
  const key = getChapterKey(chapter)

  if (chapter.title.toLowerCase().includes(searchLower)) {
    matches.push({ type: 'chapter', key })
  }

  for (const material of (chapter.materials ?? []) as MaterialLike[]) {
    if (material.title.toLowerCase().includes(searchLower)) {
      matches.push({ type: 'material', key: getMaterialKey(material) })
    }
  }

  for (const subChapter of (chapter.subChapters ?? []) as T[]) {
    collectChapterMatches(subChapter, searchLower, matches)
  }
}

function getChapterKey(chapter: ChapterLike): string {
  return ('_key' in chapter ? chapter._key : chapter.id) as string
}

function getMaterialKey(material: MaterialLike): string {
  return ('_key' in material ? material._key : material.id) as string
}

function filterChapters<T extends ChapterLike>(
  chapters: T[],
  searchLower: string
): T[] {
  const result: T[] = []

  for (const chapter of chapters) {
    const filteredChapter = filterChapter(chapter, searchLower)

    if (filteredChapter) {
      result.push(filteredChapter)
    }
  }

  return result
}

function filterChapter<T extends ChapterLike>(
  chapter: T,
  searchLower: string
): T | null {
  const chapterTitleMatches = chapter.title.toLowerCase().includes(searchLower)

  const filteredMaterials = (
    (chapter.materials ?? []) as MaterialLike[]
  ).filter((material) => material.title.toLowerCase().includes(searchLower))

  const filteredSubChapters = filterChapters(
    (chapter.subChapters ?? []) as T[],
    searchLower
  )

  const hasMatchingContent =
    chapterTitleMatches ||
    filteredMaterials.length > 0 ||
    filteredSubChapters.length > 0

  if (!hasMatchingContent) {
    return null
  }

  return {
    ...chapter,
    materials: chapterTitleMatches
      ? chapter.materials
      : (filteredMaterials as T['materials']),
    subChapters: chapterTitleMatches
      ? chapter.subChapters
      : (filteredSubChapters as T['subChapters'])
  }
}

export { useCourseChapterFilter, type UseCourseChapterFilterReturn }
