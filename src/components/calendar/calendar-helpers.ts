import type { CalendarEventType } from '@/modules/calendar/api/calendar.types'

function getEventColor(eventType: CalendarEventType) {
  switch (eventType) {
    case 'assigned-work-check-deadline':
      return 'var(--lila)'
    case 'assigned-work-solve-deadline':
      return 'var(--danger)'
    case 'assigned-work-checked':
      return 'var(--success)'
    case 'assigned-work-solved':
      return 'var(--warning)'
    case 'custom':
    default:
      return 'var(--text-light'
  }
}

export { getEventColor }
