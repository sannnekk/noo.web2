/**
 * Every hub path in one place. Paths are appended to {@link appConfig.hubUrl} and must match the
 * ones the API maps in `RealtimeEndpointsExtension.MapNooHubs`.
 */
export const HubPaths = {
  /**
   * The personal channel. The only hub held open for the whole session — every other hub is
   * opened by the page that needs it, because one connection is one WebSocket.
   */
  notifications: '/notifications',
  /** Diagnostics only; the API keeps it for the load test and health checks. */
  ping: '/ping'
} as const

export type HubPath = (typeof HubPaths)[keyof typeof HubPaths]
