import { describe, expect, it } from 'vitest'
import { CalendarPermissions, calendarPermissionPolicy } from './permissions'

describe('calendar permissions', () => {
  it('defines page access roles', () => {
    expect(
      calendarPermissionPolicy.rolesFor(CalendarPermissions.viewPage)
    ).toEqual(['admin', 'teacher', 'assistant', 'mentor', 'student'])
  })
})
