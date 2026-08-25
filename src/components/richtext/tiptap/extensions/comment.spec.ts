import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { beforeEach, describe, expect, test } from 'vitest'
import type { RichtextComment } from './comment'
import { Comment, findComment, findCommentRanges } from './comment'

const types = [
  { key: 'logical', label: 'Логическая ошибка', color: 'yellow' },
  { key: 'factual', label: 'Фактическая ошибка', color: 'red' }
]

function createEditor(content: string, onUpdate?: () => void) {
  // Commenting exists for readonly blocks, so the whole suite runs on one.
  return new Editor({
    element: document.createElement('div'),
    editable: false,
    extensions: [StarterKit, Comment.configure({ types })],
    content,
    // Passing an undefined handler registers it, which tiptap then trips over.
    ...(onUpdate ? { onUpdate } : {})
  })
}

function comment(id: string, type = 'factual', content = ''): RichtextComment {
  return { id, type, content }
}

describe('comment mark', () => {
  let editor: Editor

  beforeEach(() => {
    editor = createEditor('<p>Наполеон родился в Аяччо</p>')
  })

  test('should attach a comment to the current selection', () => {
    editor.commands.setTextSelection({ from: 1, to: 9 })
    editor.commands.setComment(comment('a', 'factual', 'Это был не он.'))

    const found = findComment(editor.state.doc, 'a')

    expect(found).toEqual({
      id: 'a',
      type: 'factual',
      content: 'Это был не он.'
    })
  })

  test('should keep line breaks in the comment content', () => {
    editor.commands.setTextSelection({ from: 1, to: 9 })
    editor.commands.setComment(comment('a', 'factual', 'Первая\nВторая'))

    expect(findComment(editor.state.doc, 'a')?.content).toBe('Первая\nВторая')
  })

  test('should let two comments cover the same words', () => {
    editor.commands.setTextSelection({ from: 1, to: 9 })
    editor.commands.setComment(comment('a', 'factual'))
    editor.commands.setTextSelection({ from: 4, to: 15 })
    editor.commands.setComment(comment('b', 'logical'))

    expect(findComment(editor.state.doc, 'a')).not.toBeNull()
    expect(findComment(editor.state.doc, 'b')).not.toBeNull()
  })

  // An intersecting mark splits the text into several nodes, each carrying its
  // own copy of the comment mark.
  test('should report every range a split comment covers', () => {
    editor.commands.setTextSelection({ from: 1, to: 15 })
    editor.commands.setComment(comment('a'))
    editor.commands.setTextSelection({ from: 5, to: 9 })
    editor.commands.setBold()

    const ranges = findCommentRanges(editor.state.doc, 'a')

    expect(ranges.length).toBeGreaterThan(1)
    expect(Math.min(...ranges.map((range) => range.from))).toBe(1)
    expect(Math.max(...ranges.map((range) => range.to))).toBe(15)
  })

  test('should rewrite type and content across every range', () => {
    editor.commands.setTextSelection({ from: 1, to: 15 })
    editor.commands.setComment(comment('a', 'factual', 'старое'))
    editor.commands.setTextSelection({ from: 5, to: 9 })
    editor.commands.setBold()

    editor.commands.updateComment('a', { type: 'logical', content: 'новое' })

    const ranges = findCommentRanges(editor.state.doc, 'a')

    expect(ranges.length).toBeGreaterThan(1)
    expect(
      ranges.every(
        (range) => range.type === 'logical' && range.content === 'новое'
      )
    ).toBe(true)
  })

  test('should detach a comment from every range', () => {
    editor.commands.setTextSelection({ from: 1, to: 15 })
    editor.commands.setComment(comment('a'))
    editor.commands.setTextSelection({ from: 5, to: 9 })
    editor.commands.setBold()

    expect(editor.commands.unsetComment('a')).toBe(true)
    expect(findCommentRanges(editor.state.doc, 'a')).toEqual([])
  })

  test('should leave other comments alone when one is removed', () => {
    editor.commands.setTextSelection({ from: 1, to: 9 })
    editor.commands.setComment(comment('a'))
    editor.commands.setTextSelection({ from: 10, to: 15 })
    editor.commands.setComment(comment('b'))

    editor.commands.unsetComment('a')

    expect(findComment(editor.state.doc, 'b')).not.toBeNull()
  })

  test('should report nothing for an id the document does not carry', () => {
    expect(findComment(editor.state.doc, 'missing')).toBeNull()
    expect(editor.commands.unsetComment('missing')).toBe(false)
    expect(
      editor.commands.updateComment('missing', { type: 'logical', content: '' })
    ).toBe(false)
  })

  // The comment only ever reaches the server because the readonly block still
  // reports the change through its model.
  test('should report the change out of a readonly editor', () => {
    const updates: string[] = []
    const readonly = createEditor('<p>Наполеон</p>', () =>
      updates.push('update')
    )

    readonly.commands.setTextSelection({ from: 1, to: 9 })
    readonly.commands.setComment(comment('a'))
    readonly.commands.unsetComment('a')

    expect(updates).toHaveLength(2)
  })

  test('should survive a round trip through the stored JSON', () => {
    editor.commands.setTextSelection({ from: 1, to: 9 })
    editor.commands.setComment(comment('a', 'factual', 'Это был не он.'))

    const reloaded = createEditor('')

    reloaded.commands.setContent(editor.getJSON())

    expect(findComment(reloaded.state.doc, 'a')).toEqual({
      id: 'a',
      type: 'factual',
      content: 'Это был не он.'
    })
  })
})
