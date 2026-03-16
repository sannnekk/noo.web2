import {
  createRolePermissionPolicy,
  type RolePermissionsMap
} from '@/core/permissions/role-permissions.utils'
import { useAuthStore } from '@/core/stores/auth.store'

const CalendarPermissions = {
  viewPage: 'viewPage'
} as const

type CalendarPermission =
  (typeof CalendarPermissions)[keyof typeof CalendarPermissions]

const calendarPermissionMap: RolePermissionsMap<CalendarPermission> = {
  [CalendarPermissions.viewPage]: [
    'admin',
    'teacher',
    'assistant',
    'mentor',
    'student'
  ]
}

const calendarPermissionPolicy = createRolePermissionPolicy<CalendarPermission>(
  calendarPermissionMap
)

function useCalendarPermissions(): {
  can: (permission: CalendarPermission) => boolean
} {
  const authStore = useAuthStore()

  function can(permission: CalendarPermission): boolean {
    return calendarPermissionPolicy.can(permission, authStore.userInfo?.role)
  }

  return {
    can
  }
}

export type { CalendarPermission }
export { CalendarPermissions, calendarPermissionPolicy, useCalendarPermissions }
