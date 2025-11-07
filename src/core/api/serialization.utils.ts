import { isRichtext, richtextJsonTransformer } from '../utils/richtext.utils'

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

export { serialize }
