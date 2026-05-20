import type { ApiEntity } from '@/core/api/api.types'

export type GoogleSheetsIntegrationType =
  | 'user-course'
  | 'user-work'
  | 'user-role'
  | 'poll-results'

export type GoogleSheetsIntegrationStatus = 'active' | 'inactive' | 'error'

export interface GoogleSheetsIntegrationEntity extends ApiEntity<'GoogleSheetsIntegration'> {
  name: string
  type: GoogleSheetsIntegrationType
  selectorValue: string
  lastRunAt: Date | null
  status: GoogleSheetsIntegrationStatus
  lastErrorText: string | null
  cronPattern: string
  googleAccount: string
}

export interface GoogleOAuthCredentialsDto {
  authuser?: string | null
  code?: string | null
  prompt?: string | null
  scope?: string | null
}

export interface CreateGoogleSheetsIntegrationDto {
  name: string
  type?: GoogleSheetsIntegrationType
  selectorValue?: string | null
  spreadsheetId?: string | null
  cronPattern: string
  googleAuthData?: string | null
  googleCredentials?: GoogleOAuthCredentialsDto
  googleOAthToken?: string | null
}
