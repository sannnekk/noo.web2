import type { MediaEntity } from '@/modules/media/api/media.types'

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  backgroundImage: MediaEntity | null
}
