import { describe, expect, it } from 'vitest'
import { TaskCardsPermissions, taskCardsPermissionPolicy } from './permissions'

describe('task cards permissions', () => {
  it('keeps saved tasks to students only', () => {
    for (const permission of Object.values(TaskCardsPermissions)) {
      expect(taskCardsPermissionPolicy.rolesFor(permission)).toEqual([
        'student'
      ])
    }
  })
})
