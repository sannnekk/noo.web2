export type UserRole = 'admin' | 'teacher' | 'assistant' | 'mentor' | 'student'

export interface UserInfo {
  id: string
  name: string
  username: string
  email: string
  role: UserRole
}

export interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiresAt: number
  userInfo: UserInfo
}

export interface RegisterPayload {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}
