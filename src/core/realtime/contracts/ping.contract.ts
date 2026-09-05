/**
 * Mirrors the API's `IRealtimePingClient`. The ping hub exists for diagnostics and the k6 load
 * scenario; nothing in the app subscribes to it, but it is part of the contract manifest and so
 * is declared here to keep the check exhaustive.
 */
export const PingHubEvents = {
  pong: 'PongAsync'
} as const

export interface RealtimePong {
  connectionId: string
  userId: string | null
  serverTime: Date
}
