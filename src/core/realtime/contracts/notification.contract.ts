import type { NotificationEntity } from '@/core/api/endpoints/notification.types'

/**
 * Mirrors the API's `INotificationHubClient`. Method names are the wire names SignalR uses, so
 * they carry the `Async` suffix the C# side requires — `realtime-contract.spec.ts` fails if the
 * two drift apart.
 */
export const NotificationHubEvents = {
  notificationCreated: 'NotificationCreatedAsync'
} as const

/** Payload of `NotificationCreatedAsync`; the API's `NotificationDTO`. */
export type NotificationCreatedPayload = NotificationEntity
