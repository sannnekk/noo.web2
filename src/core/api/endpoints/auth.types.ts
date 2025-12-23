export type UserRole = 'admin' | 'teacher' | 'mentor' | 'assistant' | 'student'

export interface UserInfo {
  id: string
  name: string | null
  username: string | null
  email: string | null
  role: UserRole
}

export interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export interface LoginResponse {
  accessToken: string | null
  expiresAt: string
  userInfo: UserInfo
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
