import PaneLayout from '@/layouts/pane-layout.vue'
import type { ApplicationModule } from '@/types/ApplicationModule'
import type { SettingsPageProps } from './pages/settings-page.vue'
import type { SettingsPageTab } from './types'

const module: ApplicationModule = {
  name: 'settings',
  routes: [
    {
      name: 'settings',
      path: '/settings/:tabId?',
      meta: {
        pageTitle: 'Настройки',
        tabTitle: 'Настройки',
        layout: PaneLayout
      },
      component: () => import('./pages/settings-page.vue'),
      props: (route): SettingsPageProps => {
        return {
          tabId: String(route.query.tabId ?? 'account') as SettingsPageTab
        }
      },
      redirect: { name: 'settings.account' },
      children: [
        {
          name: 'settings.account',
          path: 'account',
          meta: {
            pageTitle: 'Настройки аккаунта',
            tabTitle: 'Аккаунт'
          },
          component: () => import('./views/account-settings-view.vue')
        },

        {
          name: 'settings.telegram',
          path: 'telegram',
          meta: {
            pageTitle: 'Настройки Telegram',
            tabTitle: 'Telegram'
          },
          component: () => import('./views/telegram-settings-view.vue')
        },

        {
          name: 'settings.payment',
          path: 'payment',
          meta: {
            pageTitle: 'Настройки оплаты',
            tabTitle: 'Оплата'
          },
          component: () => import('./views/payment-settings-view.vue')
        },

        {
          name: 'settings.personalization',
          path: 'personalization',
          meta: {
            pageTitle: 'Настройки персонализации',
            tabTitle: 'Персонализация'
          },
          component: () => import('./views/personalization-settings-view.vue')
        },

        {
          name: 'settings.notifications',
          path: 'notifications',
          meta: {
            pageTitle: 'Управление уведомлениями',
            tabTitle: 'Уведомления'
          },
          component: () => import('./views/notifications-settings-view.vue')
        },

        {
          name: 'settings.googleSheets',
          path: 'google-sheets',
          meta: {
            pageTitle: 'Google Sheets',
            tabTitle: 'Google Sheets'
          },
          component: () => import('./views/google-sheets-settings-view.vue')
        },

        {
          name: 'settings.subjects',
          path: 'subjects',
          meta: {
            pageTitle: 'Управление предметами',
            tabTitle: 'Предметы'
          },
          component: () => import('./views/subjects-settings-view.vue')
        },

        {
          name: 'settings.changelog',
          path: 'changelog',
          meta: {
            pageTitle: 'Журнал изменений',
            tabTitle: 'Журнал изменений'
          },
          component: () => import('./views/changelog-settings-view.vue')
        }
      ]
    }
  ]
}

export default module
