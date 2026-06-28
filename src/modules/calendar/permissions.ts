import {
  createUsePermissions,
  definePermissions,
  roles
} from '@/core/permissions/permission-policy'

const CalendarPermissions = {
  viewPage: 'viewPage'
} as const

type CalendarPermission =
  (typeof CalendarPermissions)[keyof typeof CalendarPermissions]

const calendarPermissionPolicy = definePermissions({
  [CalendarPermissions.viewPage]: roles(
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  )
})

const useCalendarPermissions = createUsePermissions(calendarPermissionPolicy)

export type { CalendarPermission }
export { CalendarPermissions, calendarPermissionPolicy, useCalendarPermissions }
