import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import NooTiptapImageView from '../noo-tiptap-image-view.vue'
import { mediaRawUrl } from './media-url'

export interface ImageOptions {
  HTMLAttributes: Record<string, unknown>
}

interface SetImageOptions {
  mediaId: string
  alt?: string
  /** Natural pixel size, stored so the placeholder can reserve space before load. */
  width?: number
  height?: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /** Insert an uploaded image, referenced by its stable media id. */
      setImage: (options: SetImageOptions) => ReturnType
    }
  }
}

/**
 * Image node that persists only the media id (plus natural size). The `src` is
 * derived from the stable `/media/{id}/raw` endpoint at render time, so stored
 * content never expires and stays independent of the API host. A Vue node view
 * renders the loading and error states.
 */
export const Image = Node.create<ImageOptions>({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'noo-richtext-image'
      }
    }
  },

  addAttributes() {
    return {
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-media-id'),
        renderHTML: (attributes) =>
          attributes.mediaId ? { 'data-media-id': attributes.mediaId } : {}
      },
      alt: {
        default: null
      },
      width: {
        default: null,
        parseHTML: (element) => parseDimension(element.getAttribute('width')),
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {}
      },
      height: {
        default: null,
        parseHTML: (element) => parseDimension(element.getAttribute('height')),
        renderHTML: (attributes) =>
          attributes.height ? { height: attributes.height } : {}
      }
    }
  },

  parseHTML() {
    return [{ tag: 'img[data-media-id]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const mediaId = node.attrs.mediaId as string | null

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        src: mediaId ? mediaRawUrl(mediaId) : null
      })
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(NooTiptapImageView)
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options })
    }
  }
})

function parseDimension(value: string | null): number | null {
  const parsed = Number.parseInt(value ?? '', 10)

  return Number.isNaN(parsed) ? null : parsed
}
