import { refreshAccessToken } from '../api/api.utils'
import { CookieStorage } from '../utils/cookies.utils'

/**
 * How close to expiry a token may be before a (re)connect refreshes it first. A hub connection
 * outlives its token by design, so the handshake is where a stale one would otherwise surface.
 */
const REFRESH_MARGIN_SECONDS = 60

function decodeExpiry(token: string): number | null {
  const payload = token.split('.')[1]

  if (!payload) {
    return null
  }

  try {
    const claims = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    ) as { exp?: number }

    return typeof claims.exp === 'number' ? claims.exp : null
  } catch {
    // An unreadable token is treated as expired: worst case one needless refresh.
    return null
  }
}

function isNearExpiry(token: string): boolean {
  const expiry = decodeExpiry(token)

  if (expiry === null) {
    return true
  }

  return expiry - Date.now() / 1000 < REFRESH_MARGIN_SECONDS
}

/**
 * The `accessTokenFactory` for every hub connection. SignalR calls it on each connect and
 * reconnect, which is exactly when a token that expired while the socket was down needs
 * replacing.
 *
 * It reuses the HTTP layer's single-flight refresh rather than starting its own, so a reconnect
 * storm and a burst of 401s share one `/auth/refresh` call instead of racing.
 */
export async function getAccessToken(): Promise<string> {
  const token = CookieStorage.get<string>(CookieStorage.StorageAliases.apiToken)

  if (!token) {
    return ''
  }

  if (!isNearExpiry(token)) {
    return token
  }

  await refreshAccessToken()

  return (
    CookieStorage.get<string>(CookieStorage.StorageAliases.apiToken) ?? token
  )
}
