import type { MediaEntity } from '@/modules/media/api/media.types'

export type FileKind = 'image' | 'pdf'

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'bmp',
  'avif'
])

const PDF_EXTENSIONS = new Set(['pdf'])

const IMAGE_MIME_PREFIX = 'image/'
const PDF_MIME = 'application/pdf'

const KIND_TO_ACCEPT: Record<FileKind, string[]> = {
  image: ['image/*'],
  pdf: ['application/pdf', '.pdf']
}

export function detectFileKind(
  source: MediaEntity | File | string
): FileKind | null {
  const extension = extractExtension(source).toLowerCase()
  const mime = extractMime(source).toLowerCase()

  if (IMAGE_EXTENSIONS.has(extension) || mime.startsWith(IMAGE_MIME_PREFIX)) {
    return 'image'
  }

  if (PDF_EXTENSIONS.has(extension) || mime === PDF_MIME) {
    return 'pdf'
  }

  return null
}

export function isAllowedKind(file: File, allowed: FileKind[]): boolean {
  const kind = detectFileKind(file)

  return kind !== null && allowed.includes(kind)
}

export function buildAcceptAttribute(kinds: FileKind[]): string {
  return kinds.flatMap((kind) => KIND_TO_ACCEPT[kind]).join(',')
}

export function fileExtension(file: File): string {
  const dotIndex = file.name.lastIndexOf('.')

  return dotIndex === -1 ? '' : file.name.slice(dotIndex + 1)
}

function extractExtension(source: MediaEntity | File | string): string {
  if (typeof source === 'string') {
    const dotIndex = source.lastIndexOf('.')

    return dotIndex === -1 ? '' : source.slice(dotIndex + 1)
  }

  if (source instanceof File) {
    return fileExtension(source)
  }

  return source.extension.replace(/^\./, '')
}

function extractMime(source: MediaEntity | File | string): string {
  if (source instanceof File) {
    return source.type
  }

  return ''
}
