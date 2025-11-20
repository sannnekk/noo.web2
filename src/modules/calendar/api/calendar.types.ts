import type { ApiEntity } from '@/core/api/api.types'

export type CalendarEventType =
  | 'custom'
  | 'assigned-work-check-deadline'
  | 'assigned-work-solve-deadline'
  | 'assigned-work-checked'
  | 'assigned-work-solved'

export interface CalendarEventEntity extends ApiEntity<'CalendarEvent'> {
  assignedWorkId: string | null
  type: CalendarEventType
  title: string
  description: string | null
  startDateTime: Date
  endDateTime: Date | null
}
