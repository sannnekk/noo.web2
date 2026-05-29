import type { CourseMembershipType } from './api/course.types'

const courseMembershipTypes: { label: string; value: CourseMembershipType }[] =
  [
    { label: 'Назначен вручную', value: 'manual-assigned' },
    { label: 'Назначен внешней системой', value: 'external-assigned' },
    { label: 'Подписка', value: 'subscription' }
  ]

export { courseMembershipTypes }
