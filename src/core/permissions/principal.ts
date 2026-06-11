import { computed, type ComputedRef } from 'vue'
import type { UserRole } from '../api/endpoints/auth.types'
import { useAuthStore } from '../stores/auth.store'

/**
 * Normalized view of the currently authenticated user used to evaluate
 * permissions. It is a projection of the auth store — never a second source of
 * truth — and is kept intentionally lean: relationship checks should read their
 * facts from the resource being acted on, not from a cached list on the
 * principal (which would go stale).
 */
export interface Principal {
  id: string
  role: UserRole
}

/**
 * Plain accessor for the current principal.
 *
 * Reads straight from the auth store, so it works both inside components and in
 * places where composables are unavailable (router guards, API interceptors).
 * Accessing `store.userId`/`store.userRole` registers a reactive dependency, so
 * calling this from within a `computed` re-evaluates on login/logout.
 */
function getPrincipal(): Principal | null {
  const store = useAuthStore()

  if (!store.userId || !store.userRole) {
    return null
  }

  return { id: store.userId, role: store.userRole }
}

/**
 * Reactive wrapper around {@link getPrincipal} for use in component setup.
 */
function useCurrentPrincipal(): ComputedRef<Principal | null> {
  return computed(() => getPrincipal())
}

export { getPrincipal, useCurrentPrincipal }
