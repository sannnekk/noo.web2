import type { MediaEntity } from '@/modules/media/api/media.types'

export type FontSize = 'small' | 'normal' | 'large'

export interface UserSettings {
  fontSize: FontSize | null
  backgroundImage: MediaEntity | null
}

export interface UserSettingsUpdate {
  fontSize?: FontSize | null
  backgroundImageId?: string | null
}
