import type { UserRole } from '../api/endpoints/auth.types'
import { getPrincipal, type Principal } from './principal'
import type { PermissionPredicate } from './predicates'

/**
 * A single permission: the roles allowed to perform it, plus an optional
 * relationship/attribute predicate (`when`) evaluated against the resource
 * being acted on. The role gate is always checked first and is cheap; `when`
 * only runs for roles that pass it.
 *
 * `Ctx` is the context a permission needs to be evaluated. Role-only rules use
 * `void` (no context required at the call site); relationship rules carry the
 * resource type, which the policy then demands at every call site.
 */
interface PermissionRule<Ctx> {
  readonly roles: readonly UserRole[]
  readonly when?: PermissionPredicate<Ctx>
}

// `never` as the context makes every concrete `PermissionRule<Ctx>` assignable
// here (the predicate's context parameter is contravariant), so this works as a
// constraint without widening to `any`.
type PermissionDefinitions = Record<string, PermissionRule<never>>

type ContextOf<R> = R extends PermissionRule<infer Ctx> ? Ctx : never

/**
 * Forces the context argument to be present (and correctly typed) only for
 * permissions that declare a `when` predicate; role-only permissions take no
 * extra argument.
 */
type CanArgs<Ctx> = [Ctx] extends [void] ? [] : [context: Ctx]

interface PermissionPolicy<Defs extends PermissionDefinitions> {
  /** Whether the current principal may perform the permission. */
  can<K extends keyof Defs>(
    permission: K,
    ...args: CanArgs<ContextOf<Defs[K]>>
  ): boolean
  /** Negation of {@link can}. */
  cannot<K extends keyof Defs>(
    permission: K,
    ...args: CanArgs<ContextOf<Defs[K]>>
  ): boolean
  /**
   * The static role list for a permission. Used for route-level (role-only)
   * gating where no resource is available to evaluate relationship rules.
   */
  rolesFor(permission: keyof Defs): UserRole[]
}

interface DefinePermissionsOptions {
  /** Override how the principal is resolved. Primarily a testing seam. */
  resolvePrincipal?: () => Principal | null
}

/** Defines a role-only permission (no resource context required). */
function roles(...roleList: UserRole[]): PermissionRule<void> {
  return { roles: roleList }
}

/**
 * Defines a permission with a role gate and a relationship/attribute predicate.
 * The context type is inferred from `when`, so call sites are forced to pass
 * exactly the resource the rule needs.
 */
function rule<Ctx = void>(
  roleList: readonly UserRole[],
  when?: PermissionPredicate<Ctx>
): PermissionRule<Ctx> {
  return { roles: roleList, when }
}

/**
 * Builds a typed permission policy from a map of {@link PermissionRule}s. Each
 * permission's required context is inferred individually, so `can('x')` and
 * `can('y', { target })` are both type-checked against their own rule.
 */
function definePermissions<Defs extends PermissionDefinitions>(
  definitions: Defs,
  options: DefinePermissionsOptions = {}
): PermissionPolicy<Defs> {
  const resolvePrincipal = options.resolvePrincipal ?? getPrincipal

  function can<K extends keyof Defs>(
    permission: K,
    ...args: CanArgs<ContextOf<Defs[K]>>
  ): boolean {
    const definition = definitions[permission]
    const principal = resolvePrincipal()

    if (!principal || !definition.roles.includes(principal.role)) {
      return false
    }

    if (!definition.when) {
      return true
    }

    const [context] = args

    // The public `can` signature (via `CanArgs`) guarantees `context` matches
    // this rule's predicate; the indexed `Defs[K]` access only exposes the
    // constraint bound (`never`) here, so we erase the cast internally.
    return definition.when(principal, context as never)
  }

  function cannot<K extends keyof Defs>(
    permission: K,
    ...args: CanArgs<ContextOf<Defs[K]>>
  ): boolean {
    return !can(permission, ...args)
  }

  function rolesFor(permission: keyof Defs): UserRole[] {
    return [...definitions[permission].roles]
  }

  return { can, cannot, rolesFor }
}

export type { PermissionPolicy, PermissionRule, DefinePermissionsOptions }
export { definePermissions, roles, rule }
