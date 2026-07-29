import type { VideoReaction } from './api/nootube.types'

/**
 * Every reaction a user can leave on a video, in the order they are shown.
 * The emoji itself comes from `noo-emoji`, which resolves it by reaction name.
 */
const videoReactions: { label: string; value: VideoReaction }[] = [
  { label: 'Нравится', value: 'like' },
  { label: 'Не нравится', value: 'dislike' },
  { label: 'Обожаю', value: 'heart' },
  { label: 'Смешно', value: 'laugh' },
  { label: 'Грустно', value: 'sad' },
  { label: 'Впечатляет', value: 'mindblowing' }
]

export { videoReactions }
