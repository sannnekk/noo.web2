import { isRichtext, richtextJsonTransformer } from '../utils/richtext.utils'

const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/

function serialize(data?: unknown): string | undefined {
  if (!data) {
    return undefined
  }

  return JSON.stringify(data, (key, value) => {
    if (isRichtext(value)) {
      return richtextJsonTransformer(value)
    }

    return value
  })
}

function isIsoDateString(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) {
    return false
  }

  const timestamp = Date.parse(value)

  return !Number.isNaN(timestamp)
}

function reviveDates(key: string, value: unknown): unknown {
  if (typeof value === 'string' && isIsoDateString(value)) {
    return new Date(value)
  }

  return value
}

export { isIsoDateString, reviveDates, serialize }
