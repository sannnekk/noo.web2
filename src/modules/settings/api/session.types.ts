import type { ApiEntity } from '@/core/api/api.types'

export type DeviceType = 'unknown' | 'desktop' | 'mobile' | 'tablet'

export interface SessionEntity extends ApiEntity<'Session'> {
  lastRequestAt: Date
  device: string | null
  os: string | null
  browser: string | null
  deviceType: DeviceType
}
