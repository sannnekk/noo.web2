export type UserTheme = 'light' | 'dark' | 'system-default'

export type FontSize = 'small' | 'normal' | 'large'

export interface UserSettingsDto {
  theme?: UserTheme
  fontSize?: FontSize
}

export type UpdateUserSettingsDto = UserSettingsDto
