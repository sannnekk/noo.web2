import { JsonPatchUtils } from '@/core/utils/jsonpatch.utils'
import { describe, expect, test } from 'vitest'
import type { CourseChapterEntity } from './api/course.types'
import type { PossiblyUnsavedCourse } from './types'
import { normalizeCoursePatch } from './utils'

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
