export type UserRole = 'admin' | 'teacher' | 'mentor' | 'assistant' | 'student'

export interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
  userId: string
  userRole: UserRole
}

export interface RegisterPayload {
  name: string
  username: string
  email: string
  password: string
  confirmPassword?: string
  agreeToTerms?: boolean
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

/**
 * An external identity provider the platform can sign users in with. The list
 * the server actually offers is fetched; this type is what the UI knows how to
 * draw, see `auth-providers.config.ts`.
 */
export type ExternalAuthProvider = 'yandex' | 'vk'

/**
 * Why the provider was visited. It is decided when the attempt starts and comes
 * back from the server with the callback, never from the browser.
 */
export type ExternalAuthIntent = 'login' | 'link'

export interface ExternalAuthProviderInfo {
  provider: ExternalAuthProvider
  displayName: string
}

export interface StartExternalAuthPayload {
  provider: ExternalAuthProvider
  /** Relative path to land on once the callback succeeds. */
  returnUrl?: string
}

export interface ExternalAuthUrl {
  url: string
}

export interface ExternalAuthCallbackPayload {
  provider: ExternalAuthProvider
  /** The callback query string as the browser received it, passed through untouched. */
  parameters: Record<string, string>
}

export interface ExternalAuthResult {
  intent: ExternalAuthIntent
  provider: ExternalAuthProvider
  returnUrl: string | null
  /** Null when the intent was to link a provider to an already open session. */
  session: LoginResponse | null
}

export interface LinkedIdentity {
  provider: ExternalAuthProvider
  email: string | null
  displayName: string | null
  lastLoginAt: string | null
  linkedAt: string
}
