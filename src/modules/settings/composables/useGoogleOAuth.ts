import { isApiError } from '@/core/api/api.utils'
import { shallowRef } from 'vue'
import { GoogleSheetsService } from '../api/google-sheets.service'

/**
 * Message the callback route posts back to the window that opened it.
 * Kept in one place so both sides agree on the shape.
 */
export interface GoogleOAuthMessage {
  source: 'noo-google-oauth'
  code?: string
  state?: string
  error?: string
}

export interface GoogleOAuthGrant {
  code: string
  state: string
}

const POPUP_FEATURES = 'width=520,height=640,menubar=no,toolbar=no'

/**
 * Runs the Google consent flow in a popup and resolves with the authorization
 * code. A fresh consent is required for every integration, so this is always
 * called as part of creating one — never reused from a previous grant.
 */
export function useGoogleOAuth() {
  const isConnecting = shallowRef(false)
  const error = shallowRef<string | null>(null)

  async function connect(): Promise<GoogleOAuthGrant | null> {
    isConnecting.value = true
    error.value = null

    try {
      const response = await GoogleSheetsService.getOAuthUrl()

      if (isApiError(response) || !response.data) {
        error.value = 'Не удалось начать авторизацию в Google'

        return null
      }

      const { url, state } = response.data
      const popup = window.open(url, 'noo-google-oauth', POPUP_FEATURES)

      if (!popup) {
        error.value =
          'Всплывающее окно заблокировано браузером. Разрешите всплывающие окна и попробуйте снова'

        return null
      }

      const grant = await waitForGrant(popup, state)

      if (!grant) {
        error.value = 'Авторизация в Google не была завершена'
      }

      return grant
    } finally {
      isConnecting.value = false
    }
  }

  return { connect, isConnecting, error }
}

function waitForGrant(
  popup: Window,
  expectedState: string
): Promise<GoogleOAuthGrant | null> {
  return new Promise((resolve) => {
    let settled = false

    function finish(grant: GoogleOAuthGrant | null): void {
      if (settled) {
        return
      }

      settled = true
      window.removeEventListener('message', onMessage)
      window.clearInterval(closeWatcher)
      popup.close()
      resolve(grant)
    }

    function onMessage(event: MessageEvent): void {
      // The callback route is served by this app, so anything from another
      // origin is not ours to trust.
      if (event.origin !== window.location.origin) {
        return
      }

      const message = event.data as GoogleOAuthMessage | null

      if (message?.source !== 'noo-google-oauth') {
        return
      }

      // Google echoes the state back untouched; a mismatch means this code did
      // not come from the consent we started.
      if (!message.code || message.state !== expectedState) {
        finish(null)

        return
      }

      finish({ code: message.code, state: message.state })
    }

    // The user can simply close the popup, which produces no message at all.
    const closeWatcher = window.setInterval(() => {
      if (popup.closed) {
        finish(null)
      }
    }, 500)

    window.addEventListener('message', onMessage)
  })
}
