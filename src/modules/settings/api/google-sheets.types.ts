import type { ApiEntity } from '@/core/api/api.types'
import type { UserRole } from '@/core/api/endpoints/auth.types'

export type GoogleSheetsIntegrationType =
  'users' | 'courses' | 'poll-results' | 'assigned-works'

/** Whether the user has the integration enabled, independent of any run in progress. */
export type GoogleSheetsIntegrationStatus = 'active' | 'inactive' | 'error'

/** Where the integration is in its run cycle. */
export type GoogleSheetsIntegrationRunState = 'idle' | 'queued' | 'running'

export type GoogleSheetsIntegrationSchedule =
  'manual' | 'hourly' | 'daily' | 'weekly'

/**
 * Selection criteria for an export. Which fields matter depends on the export
 * type — the backend profile for that type validates them.
 */
export interface ExportParameters {
  role?: UserRole | null
  courseId?: string | null
  subjectId?: string | null
  createdFrom?: Date | null
  createdTo?: Date | null
  pollId?: string | null
  studentId?: string | null
  mentorId?: string | null
}

export interface GoogleSheetsIntegrationEntity extends ApiEntity<'GoogleSheetsIntegration'> {
  name: string
  type: GoogleSheetsIntegrationType
  parameters: ExportParameters
  schedule: GoogleSheetsIntegrationSchedule
  nextRunAt: Date | null
  lastRunAt: Date | null
  status: GoogleSheetsIntegrationStatus
  runState: GoogleSheetsIntegrationRunState
  lastErrorText: string | null
  lastRowCount: number | null
  googleAccount: string | null
  spreadsheetUrl: string | null
  ownerId: string
}

export interface CreateGoogleSheetsIntegrationDto {
  name: string
  type: GoogleSheetsIntegrationType
  parameters: ExportParameters
  schedule: GoogleSheetsIntegrationSchedule
  /** One-time authorization code from the Google consent popup. */
  googleAuthCode: string
  /** The state handed out with the consent URL, proving the code is ours. */
  googleAuthState: string
}

export interface UpdateGoogleSheetsIntegrationDto {
  name?: string
  schedule?: GoogleSheetsIntegrationSchedule
  status?: GoogleSheetsIntegrationStatus
}

export interface GoogleOAuthUrlDto {
  url: string
  state: string
}
