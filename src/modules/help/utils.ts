import { uid } from '@/core/utils/id.utils'
import type { IRichText } from '@/core/utils/richtext.utils'
import type { JSONContent } from '@tiptap/vue-3'
import type {
  PossiblyUnsavedSupportArticle,
  SupportArticleEntity
} from './api/support.types'

/** How much of an article's body to keep around a match, in characters. */
const EXCERPT_RADIUS = 70

export interface SupportArticleMatch {
  article: SupportArticleEntity
  /** A slice of the body around the match, or the opening of it. */
  excerpt: string
}

function toPossiblyUnsaved(
  entity: SupportArticleEntity
): PossiblyUnsavedSupportArticle {
  return {
    ...entity,
    _key: uid()
  }
}

/**
 * Flattens a rich text document into the text a reader would see, so it can be
 * searched and excerpted. Block boundaries become spaces rather than being
 * dropped, or the last word of a paragraph would run into the first of the next.
 */
function richTextToPlainText(richText: IRichText | null | undefined): string {
  if (!richText) {
    return ''
  }

  return collectText(richText as JSONContent)
    .replace(/\s+/g, ' ')
    .trim()
}

function collectText(node: JSONContent): string {
  if (typeof node.text === 'string') {
    return node.text
  }

  return (node.content ?? []).map(collectText).join(' ')
}

/**
 * Searches articles by title and body, titles first.
 *
 * The whole help section is small enough to hold in memory, so this runs in the
 * browser over the articles already loaded rather than against an endpoint the
 * API does not have. Should the article count grow past that, this is the piece
 * to replace with a server-side search.
 */
function searchArticles(
  articles: SupportArticleEntity[],
  search: string,
  maxResults = 8
): SupportArticleMatch[] {
  const query = search.trim().toLowerCase()

  if (!query) {
    return []
  }

  const byTitle: SupportArticleMatch[] = []
  const byContent: SupportArticleMatch[] = []

  for (const article of articles) {
    const content = richTextToPlainText(article.content)
    const contentIndex = content.toLowerCase().indexOf(query)

    if (article.title.toLowerCase().includes(query)) {
      byTitle.push({ article, excerpt: excerpt(content, contentIndex) })
    } else if (contentIndex !== -1) {
      byContent.push({ article, excerpt: excerpt(content, contentIndex) })
    }
  }

  return [...byTitle, ...byContent].slice(0, maxResults)
}

export interface TextSegment {
  text: string
  isMatch: boolean
}

/**
 * Splits text into alternating plain and matching segments, so a result can
 * mark what the reader searched for without the template building HTML.
 */
function splitByQuery(text: string, search: string): TextSegment[] {
  const query = search.trim().toLowerCase()

  if (!query) {
    return [{ text, isMatch: false }]
  }

  const segments: TextSegment[] = []
  const haystack = text.toLowerCase()
  let cursor = 0

  for (
    let index = haystack.indexOf(query);
    index !== -1;
    index = haystack.indexOf(query, cursor)
  ) {
    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index), isMatch: false })
    }

    segments.push({
      text: text.slice(index, index + query.length),
      isMatch: true
    })
    cursor = index + query.length
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isMatch: false })
  }

  return segments
}

/**
 * A readable window of the body around `index`, or its opening when the match
 * was in the title and there is nothing to centre on.
 */
function excerpt(content: string, index: number): string {
  if (!content) {
    return ''
  }

  const start = Math.max(0, (index === -1 ? 0 : index) - EXCERPT_RADIUS)
  const end = Math.min(content.length, start + EXCERPT_RADIUS * 3)

  return `${start > 0 ? '…' : ''}${content.slice(start, end)}${
    end < content.length ? '…' : ''
  }`
}

export { richTextToPlainText, searchArticles, splitByQuery, toPossiblyUnsaved }
