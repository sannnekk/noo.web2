import type { UserRole } from '../api/endpoints/auth.types'
import type { Principal } from './principal'

/**
 * A relationship/attribute check evaluated on top of the role gate. Receives
 * the current {@link Principal} and the context describing what is being acted
 * on, and returns whether the action is allowed.
 */
type PermissionPredicate<Ctx> = (principal: Principal, context: Ctx) => boolean

/**
 * Standard shape for "acting on a single resource" rules. The resource is
 * nullable so predicates can be evaluated before it has loaded — in that case
 * they default to denying (see {@link targetIsSelf} / {@link targetIsNotSelf}).
 */
interface TargetContext<T> {
  target: T | null | undefined
}

/** Inverts a predicate. */
function not<Ctx>(
  predicate: PermissionPredicate<Ctx>
): PermissionPredicate<Ctx> {
  return (principal, context) => !predicate(principal, context)
}

/** Passes when every predicate passes. */
function allOf<Ctx>(
  ...predicates: PermissionPredicate<Ctx>[]
): PermissionPredicate<Ctx> {
  return (principal, context) =>
    predicates.every((predicate) => predicate(principal, context))
}

/** Passes when at least one predicate passes. */
function anyOf<Ctx>(
  ...predicates: PermissionPredicate<Ctx>[]
): PermissionPredicate<Ctx> {
  return (principal, context) =>
    predicates.some((predicate) => predicate(principal, context))
}

/**
 * Whether the targeted resource is the principal themselves. Default-denies
 * when the target is not yet loaded.
 */
const targetIsSelf: PermissionPredicate<TargetContext<{ id: string }>> = (
  principal,
  { target }
) => !!target && target.id === principal.id

/**
 * Whether the targeted resource is someone other than the principal. Used to
 * prevent users from performing destructive actions on their own account.
 * Default-denies when the target is not yet loaded.
 */
const targetIsNotSelf: PermissionPredicate<TargetContext<{ id: string }>> = (
  principal,
  { target }
) => !!target && target.id !== principal.id

/**
 * Wether target has one of the specified roles.
 */
const targetHasRole =
  (
    ...roles: UserRole[]
  ): PermissionPredicate<TargetContext<{ role: UserRole }>> =>
  (_, { target }) =>
    !!target && roles.includes(target.role)

/**
 * Whether the current principal has one of the specified roles. Independent of
 * the context, so it composes with relationship predicates (e.g. to allow a
 * privileged role to act on any resource via `anyOf(...)`).
 */
const principalHasRole =
  <Ctx>(...roles: UserRole[]): PermissionPredicate<Ctx> =>
  (principal) =>
    roles.includes(principal.role)

export type { PermissionPredicate, TargetContext }
export {
  not,
  allOf,
  anyOf,
  targetIsSelf,
  targetIsNotSelf,
  targetHasRole,
  principalHasRole
}
