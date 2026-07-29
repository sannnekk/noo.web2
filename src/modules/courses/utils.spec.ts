import { JsonPatchUtils } from '@/core/utils/jsonpatch.utils'
import { describe, expect, test } from 'vitest'
import type {
  CourseChapterEntity,
  CourseMaterialEntity
} from './api/course.types'
import type { PossiblyUnsavedCourse } from './types'
import {
  collectPinnedMaterials,
  findChapterIdPathToMaterial,
  normalizeCoursePatch
} from './utils'

type PatchOp = { op: string; path: string; value?: unknown }

function chapter(
  id: string,
  overrides: Partial<CourseChapterEntity> = {}
): CourseChapterEntity {
  return {
    _entityName: 'CourseChapter',
    id,
    createdAt: new Date(0),
    updatedAt: null,
    order: 1,
    title: `Chapter ${id}`,
    color: null,
    isActive: true,
    publishAt: null,
    subChapters: [],
    materials: [],
    ...overrides
  }
}

function material(
  id: string,
  chapterId: string,
  overrides: Partial<CourseMaterialEntity> = {}
): CourseMaterialEntity {
  return {
    _entityName: 'CourseMaterial',
    id,
    createdAt: new Date(0),
    updatedAt: null,
    order: 1,
    title: `Material ${id}`,
    titleColor: null,
    isActive: true,
    isPinned: false,
    publishAt: null,
    chapterId,
    contentId: null,
    ...overrides
  }
}

// The sidebar expands the tree by opening every chapter on this path, so a missing
// ancestor leaves the material invisible even though its own chapter is "opened".
describe('findChapterIdPathToMaterial', () => {
  test('returns the whole ancestor chain, root first', () => {
    const tree = [
      chapter('A', {
        subChapters: [
          chapter('A1', {
            subChapters: [chapter('A1a', { materials: [material('m', 'A1a')] })]
          })
        ]
      })
    ]

    expect(findChapterIdPathToMaterial(tree, 'm')).toEqual(['A', 'A1', 'A1a'])
  })

  test('returns a single chapter for a material at the root level', () => {
    const tree = [chapter('A', { materials: [material('m', 'A')] })]

    expect(findChapterIdPathToMaterial(tree, 'm')).toEqual(['A'])
  })

  test('skips branches that do not contain the material', () => {
    const tree = [
      chapter('A', { materials: [material('other', 'A')] }),
      chapter('B', {
        subChapters: [chapter('B1', { materials: [material('m', 'B1')] })]
      })
    ]

    expect(findChapterIdPathToMaterial(tree, 'm')).toEqual(['B', 'B1'])
  })

  test('returns an empty path for an unknown material or missing chapters', () => {
    const tree = [chapter('A', { materials: [material('m', 'A')] })]

    expect(findChapterIdPathToMaterial(tree, 'unknown')).toEqual([])
    expect(findChapterIdPathToMaterial(undefined, 'm')).toEqual([])
  })
})

// The sidebar lists pinned materials above the tree, so they have to be gathered from
// every nesting level, not just the root chapters.
describe('collectPinnedMaterials', () => {
  test('collects pinned materials from the whole tree, in tree order', () => {
    const tree = [
      chapter('A', {
        materials: [
          material('a1', 'A', { isPinned: true }),
          material('a2', 'A')
        ],
        subChapters: [
          chapter('A1', {
            materials: [material('a1a', 'A1', { isPinned: true })]
          })
        ]
      }),
      chapter('B', { materials: [material('b1', 'B')] })
    ]

    expect(collectPinnedMaterials(tree).map((m) => m.id)).toEqual(['a1', 'a1a'])
  })

  test('returns an empty list when nothing is pinned or chapters are missing', () => {
    expect(
      collectPinnedMaterials([
        chapter('A', { materials: [material('m', 'A')] })
      ])
    ).toEqual([])
    expect(collectPinnedMaterials(undefined)).toEqual([])
  })
})

// Mirrors how the store observes the course. Passing an inline literal (or inspecting the
// typed ops) would make the generic patch type recurse on the self-referential chapter
// tree, so we cast to PossiblyUnsavedCourse on the way in and to a flat op shape on the
// way out.
function observeCourse(course: {
  chapters: CourseChapterEntity[]
}): () => PatchOp[] {
  const generator = JsonPatchUtils.observe(
    course as unknown as PossiblyUnsavedCourse,
    normalizeCoursePatch
  )

  return () => generator.generate() as unknown as PatchOp[]
}

// The update contract is flat: every chapter is a top-level entry keyed by id, with tree
// position carried by parentChapterId. These guard the frontend's half of that contract
// against regressing to the nested `subChapters` shape.
describe('normalizeCoursePatch chapter flattening', () => {
  test('lifts nested sub-chapters to the top level with parentChapterId', () => {
    const tree = [
      chapter('A', {
        subChapters: [chapter('A1', { subChapters: [chapter('A1a')] })]
      })
    ]

    const flattened = normalizeCoursePatch('chapters', tree) as {
      id: string
      parentChapterId: string | null
      subChapters?: unknown
    }[]

    expect(flattened.map((c) => c.id)).toEqual(['A', 'A1', 'A1a'])
    expect(flattened.map((c) => c.parentChapterId)).toEqual([null, 'A', 'A1'])
    expect(flattened.every((c) => !('subChapters' in c))).toBe(true)
  })

  test('returns null for an empty chapter list', () => {
    expect(normalizeCoursePatch('chapters', [])).toBeNull()
  })
})

describe('course patch generation (flat contract)', () => {
  test('adding a sub-chapter emits a flat add carrying parentChapterId', () => {
    const course = { chapters: [chapter('A')] }
    const generate = observeCourse(course)

    course.chapters[0]!.subChapters!.push(chapter('NEW'))

    const ops = generate()
    const add = ops.find((op) => op.op === 'add')

    expect(add?.path).toBe('/chapters/NEW')
    expect((add?.value as { parentChapterId: string }).parentChapterId).toBe(
      'A'
    )
    // The nested path must never appear.
    expect(ops.some((op) => op.path.includes('subChapters'))).toBe(false)
  })

  test('moving a chapter to another parent is a single parentChapterId replace', () => {
    const course = {
      chapters: [chapter('A', { subChapters: [chapter('S')] }), chapter('B')]
    }
    const generate = observeCourse(course)

    const sub = course.chapters[0]!.subChapters!.pop()!
    course.chapters[1]!.subChapters!.push(sub)

    const ops = generate()

    expect(ops).toContainEqual({
      op: 'replace',
      path: '/chapters/S/parentChapterId',
      value: 'B'
    })
    // parentChapterId must survive the excluded-keys filter.
    expect(ops.some((op) => op.path.endsWith('parentChapterId'))).toBe(true)
  })

  test('an untouched course produces no operations', () => {
    const course = {
      chapters: [chapter('A', { subChapters: [chapter('S')] })]
    }
    const generate = observeCourse(course)

    expect(generate()).toHaveLength(0)
  })
})
