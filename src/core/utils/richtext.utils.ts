import type { JSONContent } from '@tiptap/vue-3'
import { Delta, type Op } from 'quill/core'
import { z } from 'zod'

export type RichTextType = 'delta' | 'tiptap'

interface DeltaContentType {
  ops: Op[]
}

export interface IDeltaRichText extends DeltaContentType {
  $type: 'delta'
}

export interface ITiptapRichText {
  $type: 'tiptap'
  type: string
  content?: JSONContent[]
}

export type IRichText = IDeltaRichText | ITiptapRichText

const DeltaRichTextSchema = z.object({
  $type: z.literal('delta'),
  ops: z.array(
    z.object({
      insert: z.union([z.string(), z.object({})]),
      attributes: z.record(z.any()).optional()
    })
  )
})

const TiptapRichTextSchema = z.object({
  $type: z.literal('tiptap'),
  type: z.string(),
  content: z.array(z.any()).optional()
})

const RichTextSchema = z.discriminatedUnion('$type', [
  DeltaRichTextSchema,
  TiptapRichTextSchema
])

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

  if (richText.$type === 'tiptap') {
    return isTiptapEmpty(richText)
  }

  return isDeltaEmptyOrWhitespace(richText)
}

function isTiptapEmpty(richText: ITiptapRichText): boolean {
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

function isDeltaEmptyOrWhitespace(
  delta: DeltaContentType | undefined | null
): boolean {
  if (!delta) {
    return true
  }
  if (delta.ops.length === 0) {
    return true
  }

  for (const op of delta.ops) {
    if (op.insert instanceof Object) {
      return false
    }
    if (op.insert?.trim() !== '') {
      return false
    }
  }

  return true
}

function emptyDelta(): Delta {
  return new Delta().insert('\n')
}

function emptyRichText(type: RichTextType = 'tiptap'): IRichText {
  if (type === 'delta') {
    return {
      $type: 'delta',
      ...emptyDelta()
    }
  }

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

  return (
    '$type' in value && (value.$type === 'delta' || value.$type === 'tiptap')
  )
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
