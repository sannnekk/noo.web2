import type { RichtextCommentType } from '@/components/richtext/tiptap/extensions/comment'

/** The kinds of mistake a mentor marks up inside a text answer. */
export const answerCommentTypes: RichtextCommentType[] = [
  { key: 'logical', label: 'Логическая ошибка', color: 'var(--warning)' },
  { key: 'factual', label: 'Фактическая ошибка', color: 'var(--danger)' }
]
