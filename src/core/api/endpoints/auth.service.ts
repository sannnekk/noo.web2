import { type ApiResponse, Api } from '../api.utils'
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload
} from './auth.types'

interface IAuthService {
  login: (paylod: LoginPayload) => Promise<ApiResponse<LoginResponse>>
  usernameIsFree: (username: string) => Promise<ApiResponse<boolean>>
  forgotPassword: (email: string) => Promise<ApiResponse>
  resetPassword: (payload: ResetPasswordPayload) => Promise<ApiResponse>
  verifyEmail: (token: string) => Promise<ApiResponse>
  register: (payload: RegisterPayload) => Promise<ApiResponse>
  removeCurrentSession: () => Promise<ApiResponse>
}

async function login(
  payload: LoginPayload
): Promise<ApiResponse<LoginResponse>> {
  return await Api.post<LoginPayload, LoginResponse>('/auth/login', payload)
}

async function usernameIsFree(username: string): Promise<ApiResponse<boolean>> {
  return await Api.get<boolean>(`/auth/username-check/${username}`)
}

async function forgotPassword(email: string): Promise<ApiResponse> {
  return await Api.post('/auth/forgot-password', { email })
}

async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ApiResponse> {
  return await Api.post('/auth/reset-password', payload)
}

async function verifyEmail(token: string): Promise<ApiResponse> {
  return await Api.post('/auth/verify-email', { token })
}

async function register(payload: RegisterPayload): Promise<ApiResponse> {
  return await Api.post('/auth/register', payload)
}

async function removeCurrentSession(): Promise<ApiResponse> {
  return await Api.delete('/auth/current-session')
}

export const AuthService: IAuthService = {
  login,
  usernameIsFree,
  forgotPassword,
  resetPassword,
  verifyEmail,
  register,
  removeCurrentSession
}
