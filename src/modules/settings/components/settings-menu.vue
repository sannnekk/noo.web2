<template>
  <ul class="settings-menu">
    <li
      v-for="(menuItem, index) in menuItems"
      :key="index"
      class="settings-menu__item"
    >
      <router-link
        v-if="can(menuItem.permission)"
        :to="menuItem.to"
      >
        <div class="settings-menu__item__icon">
          <noo-icon :name="menuItem.icon" />
        </div>
        <div class="settings-menu__item__content">
          <noo-title
            :size="4"
            no-margin
          >
            {{ menuItem.title }}
          </noo-title>
          <noo-text-block
            size="small"
            no-margin
            dimmed
          >
            {{ menuItem.description }}
          </noo-text-block>
        </div>
      </router-link>
    </li>
  </ul>
</template>

<script setup lang="ts">
import {
  useSettingsPermissions,
  type SettingsPermission,
  SettingsPermissions
} from '../permissions.ts'
import type { RouteLocationAsRelativeGeneric } from 'vue-router'
import type { IconName } from '@/components/icons/noo-icon.vue'

interface MenuItem {
  title: string
  description?: string
  icon: IconName
  to: RouteLocationAsRelativeGeneric
  permission: SettingsPermission
}

const { can } = useSettingsPermissions()

const menuItems: MenuItem[] = [
  {
    title: 'Аккаунт',
    description: 'Смена email, имени, пароля',
    icon: 'user',
    to: {
      name: 'settings.account'
    },
    permission: SettingsPermissions.manageAccountSettings
  },
  {
    title: 'Telegram',
    description: 'Привязка аккаунта и настройка уведослений в телеграме',
    icon: 'telegram-blue',
    to: { name: 'settings.telegram' },
    permission: SettingsPermissions.manageTelegramSettings
  },
  {
    title: 'Оплата',
    description: 'Просмотр истории покупок и управление подпиской',
    icon: 'payment',
    to: { name: 'settings.payment' },
    permission: SettingsPermissions.managePaymentSettings
  },
  {
    title: 'Персонализация',
    description: 'Обои, тема, размер шрифта',
    icon: 'brush',
    to: { name: 'settings.notifications' },
    permission: SettingsPermissions.managePersonalizationSettings
  },
  {
    title: 'Предметы',
    description: 'Создание, редактирование и удаление предметов',
    icon: 'subject',
    to: { name: 'settings.subjects' },
    permission: SettingsPermissions.manageSubjects
  },
  {
    title: 'Google Sheets',
    description: 'Интеграция с Google Sheets и Google Drive',
    icon: 'google-sheets',
    to: { name: 'settings.googleSheets' },
    permission: SettingsPermissions.manageGoogleSheets
  },
  {
    title: 'Уведомления',
    description: 'Массовая рассылка уведомлений пользователям',
    icon: 'notifications',
    to: { name: 'settings.notifications' },
    permission: SettingsPermissions.manageNotifications
  },
  {
    title: 'История изменений',
    description: 'Просмотр истории изменений в системе и новых функций',
    icon: 'info',
    to: { name: 'settings.changelog' },
    permission: SettingsPermissions.viewChangelog
  }
]
</script>

<style scoped lang="sass">
.settings-menu
  list-style: none
  margin: 0
  padding: 0

  &__item
    a
      padding: 1em
      text-decoration: none
      color: inherit
      display: flex
      gap: 1em
      align-items: center
      border-radius: var(--border-radius)

      &:hover
        background-color: var(--light-background-color)
        border-radius: var(--border-radius)

    &__icon
      font-size: 2em
       display: flex
       align-items: center
</style>
