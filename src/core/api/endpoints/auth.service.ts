import { type ApiResponse, Api } from '../api.utils'
import type {
  ExternalAuthCallbackPayload,
  ExternalAuthProvider,
  ExternalAuthProviderInfo,
  ExternalAuthResult,
  ExternalAuthUrl,
  LinkedIdentity,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  StartExternalAuthPayload
} from './auth.types'

interface IAuthService {
  login: (paylod: LoginPayload) => Promise<ApiResponse<LoginResponse>>
  usernameIsFree: (username: string) => Promise<ApiResponse<boolean>>
  forgotPassword: (email: string) => Promise<ApiResponse>
  resetPassword: (payload: ResetPasswordPayload) => Promise<ApiResponse>
  verifyEmail: (token: string) => Promise<ApiResponse>
  register: (payload: RegisterPayload) => Promise<ApiResponse>
  removeCurrentSession: () => Promise<ApiResponse>
  getExternalProviders: () => Promise<ApiResponse<ExternalAuthProviderInfo[]>>
  startExternalAuth: (
    payload: StartExternalAuthPayload
  ) => Promise<ApiResponse<ExternalAuthUrl>>
  startExternalLink: (
    payload: StartExternalAuthPayload
  ) => Promise<ApiResponse<ExternalAuthUrl>>
  completeExternalAuth: (
    payload: ExternalAuthCallbackPayload
  ) => Promise<ApiResponse<ExternalAuthResult>>
  getLinkedIdentities: () => Promise<ApiResponse<LinkedIdentity[]>>
  unlinkIdentity: (provider: ExternalAuthProvider) => Promise<ApiResponse>
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
  return await Api.patch('/auth/request-password-change', { email })
}

async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ApiResponse> {
  return await Api.patch('/auth/confirm-password-change', payload)
}

async function verifyEmail(token: string): Promise<ApiResponse> {
  return await Api.patch('/auth/confirm-email', { token })
}

async function register(payload: RegisterPayload): Promise<ApiResponse> {
  const dto = {
    name: payload.name,
    username: payload.username,
    email: payload.email,
    password: payload.password
  }

  return await Api.post('/auth/register', dto)
}

async function removeCurrentSession(): Promise<ApiResponse> {
  return await Api.delete('/session')
}

async function getExternalProviders(): Promise<
  ApiResponse<ExternalAuthProviderInfo[]>
> {
  return await Api.get<ExternalAuthProviderInfo[]>('/auth/external/providers')
}

async function startExternalAuth({
  provider,
  returnUrl
}: StartExternalAuthPayload): Promise<ApiResponse<ExternalAuthUrl>> {
  return await Api.post<{ returnUrl?: string }, ExternalAuthUrl>(
    `/auth/external/${provider}/start`,
    { returnUrl }
  )
}

async function startExternalLink({
  provider,
  returnUrl
}: StartExternalAuthPayload): Promise<ApiResponse<ExternalAuthUrl>> {
  return await Api.post<{ returnUrl?: string }, ExternalAuthUrl>(
    `/auth/external/${provider}/link/start`,
    { returnUrl }
  )
}

async function completeExternalAuth({
  provider,
  parameters
}: ExternalAuthCallbackPayload): Promise<ApiResponse<ExternalAuthResult>> {
  return await Api.post<
    { parameters: Record<string, string> },
    ExternalAuthResult
  >(`/auth/external/${provider}/callback`, { parameters })
}

async function getLinkedIdentities(): Promise<ApiResponse<LinkedIdentity[]>> {
  return await Api.get<LinkedIdentity[]>('/auth/external/identities')
}

async function unlinkIdentity(
  provider: ExternalAuthProvider
): Promise<ApiResponse> {
  return await Api.delete(`/auth/external/identities/${provider}`)
}

export const AuthService: IAuthService = {
  login,
  usernameIsFree,
  forgotPassword,
  resetPassword,
  verifyEmail,
  register,
  removeCurrentSession,
  getExternalProviders,
  startExternalAuth,
  startExternalLink,
  completeExternalAuth,
  getLinkedIdentities,
  unlinkIdentity
}
