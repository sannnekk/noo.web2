import type { IRichText } from '@/core/utils/richtext.utils'
import { describe, expect, test } from 'vitest'
import type { SupportArticleEntity, SupportCategory } from './api/support.types'
import { richTextToPlainText, searchArticles, splitByQuery } from './utils'

function richText(...paragraphs: string[]): IRichText {
  return {
    $type: 'tiptap',
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }]
    }))
  }
}

function article(
  id: string,
  title: string,
  content: IRichText,
  category: SupportCategory = 'courses'
): SupportArticleEntity {
  return {
    _entityName: 'SupportArticle',
    id,
    createdAt: new Date(0),
    updatedAt: null,
    slug: id,
    title,
    content,
    isActive: true,
    category
  }
}

describe('richTextToPlainText', () => {
  test('joins blocks with a space so words do not run together', () => {
    expect(richTextToPlainText(richText('Первый абзац', 'Второй'))).toBe(
      'Первый абзац Второй'
    )
  })

  test('is empty for a document with no text', () => {
    expect(richTextToPlainText(null)).toBe('')
    expect(richTextToPlainText({ $type: 'tiptap', type: 'doc' })).toBe('')
  })
})

describe('searchArticles', () => {
  const password = article('a', 'Забыли пароль', richText('Нажмите на ссылку'))
  const access = article(
    'b',
    'Доступ к курсу',
    richText('Если пароль не подходит, восстановите его')
  )

  test('finds articles by title regardless of case', () => {
    const results = searchArticles([password, access], 'ЗАБЫЛИ')

    expect(results.map(({ article }) => article.id)).toEqual(['a'])
  })

  test('finds articles by body when the title does not match', () => {
    const results = searchArticles([password, access], 'восстановите')

    expect(results.map(({ article }) => article.id)).toEqual(['b'])
  })

  test('ranks a title match above a body match', () => {
    const results = searchArticles([access, password], 'пароль')

    expect(results.map(({ article }) => article.id)).toEqual(['a', 'b'])
  })

  test('returns nothing for a blank query', () => {
    expect(searchArticles([password, access], '   ')).toEqual([])
  })

  test('caps the number of results', () => {
    const many = Array.from({ length: 20 }, (_, index) =>
      article(String(index), 'Пароль', richText('текст'))
    )

    expect(searchArticles(many, 'пароль', 3)).toHaveLength(3)
  })

  test('excerpts the body around the match', () => {
    const long = article(
      'c',
      'Длинная статья',
      richText(`${'а'.repeat(200)} ключевое ${'б'.repeat(200)}`)
    )

    const [match] = searchArticles([long], 'ключевое')

    expect(match.excerpt).toContain('ключевое')
    expect(match.excerpt.startsWith('…')).toBe(true)
    expect(match.excerpt.endsWith('…')).toBe(true)
  })
})

describe('splitByQuery', () => {
  test('marks every occurrence of the query', () => {
    expect(splitByQuery('Пароль и ещё пароль', 'пароль')).toEqual([
      { text: 'Пароль', isMatch: true },
      { text: ' и ещё ', isMatch: false },
      { text: 'пароль', isMatch: true }
    ])
  })

  test('leaves text whole when there is no query', () => {
    expect(splitByQuery('Пароль', '  ')).toEqual([
      { text: 'Пароль', isMatch: false }
    ])
  })

  test('leaves text whole when the query does not occur', () => {
    expect(splitByQuery('Пароль', 'логин')).toEqual([
      { text: 'Пароль', isMatch: false }
    ])
  })
})
