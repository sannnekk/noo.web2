export interface UserSettings {
  theme: 'light' | 'dark' | 'system-default'
  fontSize: 'small' | 'normal' | 'large'
}

export type UserSettingsUpdate = Pick<UserSettings, 'theme' | 'fontSize'>
