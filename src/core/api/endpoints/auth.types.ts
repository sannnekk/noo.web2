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
