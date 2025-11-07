import { Delta, type Op } from 'quill/core'
import { z } from 'zod'

export type RichTextType = 'delta'

interface DeltaContentType {
  ops: Op[]
}

export interface IRichText extends DeltaContentType {
  $type: RichTextType
}

const RichTextSchema = z.object({
  $type: z.enum(['delta']),
  ops: z.array(
    z.object({
      insert: z.union([z.string(), z.object({})]),
      attributes: z.record(z.any()).optional()
    })
  )
})

function richTextsAreEqual(
  richText1: IRichText | null | undefined,
  richText2: IRichText | null | undefined
): boolean {
  return JSON.stringify(richText1 ?? {}) === JSON.stringify(richText2 ?? {})
}

function richTextIsEmpty(richText: IRichText | null | undefined): boolean {
  return isDeltaEmptyOrWhitespace(richText)
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

function emptyRichText(type: RichTextType = 'delta'): IRichText {
  return {
    $type: type,
    ...emptyDelta()
  }
}

/**
 * Makes type discriminating property come first for serialization purposes
 */
function richtextJsonTransformer(richText: IRichText): IRichText {
  const { $type, ...rest } = richText

  return {
    $type,
    ...rest
  }
}

function isRichtext(value: unknown): value is IRichText {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return '$type' in value && value.$type === 'delta'
}

export {
  emptyRichText,
  isRichtext,
  richTextIsEmpty,
  richtextJsonTransformer,
  richTextsAreEqual,
  RichTextSchema
}
