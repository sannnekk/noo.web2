import { describe, expect, it } from 'vitest'
import { definePermissions, roles, rule } from './permission-policy'
import { targetIsNotSelf, type TargetContext } from './predicates'
import type { Principal } from './principal'

type Doc = { id: string }

function policyFor(principal: Principal | null) {
  return definePermissions(
    {
      viewList: roles('admin', 'teacher'),
      deleteDoc: rule<TargetContext<Doc>>(['admin'], targetIsNotSelf)
    },
    { resolvePrincipal: () => principal }
  )
}

describe('definePermissions', () => {
  it('denies everything without a principal', () => {
    const policy = policyFor(null)

    expect(policy.can('viewList')).toBe(false)
    expect(policy.can('deleteDoc', { target: { id: 'x' } })).toBe(false)
  })

  it('gates role-only permissions by role', () => {
    expect(policyFor({ id: 'a', role: 'admin' }).can('viewList')).toBe(true)
    expect(policyFor({ id: 's', role: 'student' }).can('viewList')).toBe(false)
  })

  it('checks the role gate before the predicate', () => {
    // teacher fails the role gate even though the target is not self
    const policy = policyFor({ id: 't', role: 'teacher' })

    expect(policy.can('deleteDoc', { target: { id: 'other' } })).toBe(false)
  })

  it('runs the relationship predicate for allowed roles', () => {
    const policy = policyFor({ id: 'admin-1', role: 'admin' })

    expect(policy.can('deleteDoc', { target: { id: 'other' } })).toBe(true)
    expect(policy.can('deleteDoc', { target: { id: 'admin-1' } })).toBe(false)
  })

  it('default-denies a relationship rule while the target is missing', () => {
    const policy = policyFor({ id: 'admin-1', role: 'admin' })

    expect(policy.can('deleteDoc', { target: null })).toBe(false)
  })

  it('exposes the static role list and a cannot helper', () => {
    const policy = policyFor({ id: 's', role: 'student' })

    expect(policy.rolesFor('viewList')).toEqual(['admin', 'teacher'])
    expect(policy.cannot('viewList')).toBe(true)
  })
})
