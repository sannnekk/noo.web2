import type { MediaEntity } from '@/modules/media/api/media.types'

export type UserTheme = 'light' | 'dark' | 'system'

export type FontSize = 'small' | 'normal' | 'large'

export interface UserSettings {
  theme: UserTheme | null
  fontSize: FontSize | null
  backgroundImage: MediaEntity | null
}

export interface UserSettingsUpdate {
  theme?: UserTheme | null
  fontSize?: FontSize | null
  backgroundImageId?: string | null
}
