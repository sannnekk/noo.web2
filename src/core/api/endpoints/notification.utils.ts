import type { IconName } from '@/components/icons/noo-icon.vue'
import type { Toast } from '@/core/stores/global-ui.store'

type ToastType = NonNullable<Toast['type']>

interface NotificationPresentation {
  icon: IconName
  toastType: ToastType
}

const presentationByType: Record<string, NotificationPresentation> = {
  'assigned_work.checked': { icon: 'check-green', toastType: 'success' },
  'assigned_work.solved': { icon: 'list', toastType: 'info' },
  'assigned_work.sent_on_resolve': {
    icon: 'attention-yellow',
    toastType: 'warning'
  },
  'assigned_work.main_mentor_changed': {
    icon: 'change-user',
    toastType: 'info'
  },
  'assigned_work.helper_mentor_added': { icon: 'users', toastType: 'info' }
}

const fallbackPresentation: NotificationPresentation = {
  icon: 'notifications',
  toastType: 'info'
}

function getPresentation(type: string): NotificationPresentation {
  return presentationByType[type] ?? fallbackPresentation
}

export function getNotificationIcon(type: string): IconName {
  return getPresentation(type).icon
}

export function getNotificationToastType(type: string): ToastType {
  return getPresentation(type).toastType
}
