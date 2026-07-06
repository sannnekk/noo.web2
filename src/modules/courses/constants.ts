import type {
  CourseMaterialReaction,
  CourseMembershipType
} from './api/course.types'

const courseMembershipTypes: { label: string; value: CourseMembershipType }[] =
  [
    { label: 'Назначен вручную', value: 'manual-assigned' },
    { label: 'Назначен внешней системой', value: 'external-assigned' },
    { label: 'Подписка', value: 'subscription' }
  ]

const courseMaterialReactions: {
  label: string
  emoji: string
  value: CourseMaterialReaction
}[] = [
  { label: 'Пройдено', emoji: '✅', value: 'check' },
  { label: 'Стоит вернуться', emoji: '🤔', value: 'thinking' }
]

const courseMaterialReactionEmojis = Object.fromEntries(
  courseMaterialReactions.map((reaction) => [reaction.value, reaction.emoji])
) as Record<CourseMaterialReaction, string>

export {
  courseMaterialReactionEmojis,
  courseMaterialReactions,
  courseMembershipTypes
}
