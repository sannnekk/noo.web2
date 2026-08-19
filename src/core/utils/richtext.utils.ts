import type { JSONContent } from '@tiptap/vue-3'
import { z } from 'zod'

/**
 * The editors whose output can be stored. Every value carries its own `$type`,
 * so more than one format can sit in the database at a time — tiptap is simply
 * the only one served today, Quill's Delta having been the other until its
 * content was rewritten and it was removed.
 *
 * Adding another editor is a variant here, a schema below, and a branch in
 * `noo-richtext-editor.vue` picking the component that understands it.
 */
export type RichTextType = 'tiptap'

export interface ITiptapRichText {
  $type: 'tiptap'
  type: string
  content?: JSONContent[]
}

export type IRichText = ITiptapRichText

const TiptapRichTextSchema = z.object({
  $type: z.literal('tiptap'),
  type: z.string(),
  content: z.array(z.any()).optional()
})

const RichTextSchema = z.discriminatedUnion('$type', [TiptapRichTextSchema])

function richTextsAreEqual(
  richText1: IRichText | null | undefined,
  richText2: IRichText | null | undefined
): boolean {
  return JSON.stringify(richText1 ?? {}) === JSON.stringify(richText2 ?? {})
}

function richTextIsEmpty(richText: IRichText | null | undefined): boolean {
  if (!richText) {
    return true
  }

  return !tiptapNodeHasContent(richText)
}

/**
 * A tiptap doc is considered non-empty if it contains non-whitespace text or
 * any leaf node that isn't a plain text/paragraph wrapper (e.g. an image).
 */
function tiptapNodeHasContent(node: JSONContent): boolean {
  if (typeof node.text === 'string' && node.text.trim() !== '') {
    return true
  }

  const wrapperTypes = ['doc', 'paragraph', 'text']

  if (node.type && !wrapperTypes.includes(node.type)) {
    return true
  }

  return (node.content ?? []).some(tiptapNodeHasContent)
}

/**
 * Converts a tiptap document (from `editor.getJSON()`) into a storable rich
 * text value by tagging it with its discriminating `$type`. No HTML round-trip
 * is involved — tiptap is JSON-native.
 */
function tiptapToRichText(doc: JSONContent): ITiptapRichText {
  return {
    $type: 'tiptap',
    type: doc.type ?? 'doc',
    content: doc.content
  }
}

/**
 * Strips the `$type` tag to return the bare tiptap document that the editor
 * understands.
 */
function richTextToTiptap(
  richText: ITiptapRichText | null | undefined
): JSONContent {
  if (!richText) {
    return { type: 'doc', content: [] }
  }

  return { type: richText.type, content: richText.content }
}

function emptyRichText(): IRichText {
  return { $type: 'tiptap', type: 'doc', content: [] }
}

/**
 * Makes type discriminating property come first for serialization purposes
 */
function richtextJsonTransformer(richText: IRichText): IRichText {
  const { $type, ...rest } = richText

  return {
    $type,
    ...rest
  } as IRichText
}

function isRichtext(value: unknown): value is IRichText {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return '$type' in value && value.$type === 'tiptap'
}

export {
  emptyRichText,
  isRichtext,
  richTextIsEmpty,
  richTextToTiptap,
  richtextJsonTransformer,
  richTextsAreEqual,
  RichTextSchema,
  tiptapToRichText
}
