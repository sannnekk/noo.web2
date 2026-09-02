import { describe, expect, it } from 'vitest'
import { SettingsPermissions, settingsPermissionPolicy } from './permissions'

describe('settings permissions', () => {
  it('keeps the platform links to admins', () => {
    expect(
      settingsPermissionPolicy.rolesFor(SettingsPermissions.managePlatformLinks)
    ).toEqual(['admin'])
  })
})
