/**
 * Keep-alive timings, which must stay in step with the API's `Realtime` configuration section.
 * SignalR does not negotiate these — each side is configured independently, and getting the
 * relationship wrong makes connections drop and reconnect on a timer rather than fail outright.
 */
export const RealtimeTiming = {
  /**
   * How long to wait for anything from the server before treating the connection as dead.
   *
   * Must be at least **double** the server's `Realtime:KeepAliveSeconds` (30s). The client
   * default is 30s, which equals the server's ping interval — so the client gives up at exactly
   * the moment the next ping is due, and every connection dies and re-negotiates every ~30s.
   */
  serverTimeoutMs: 60_000,

  /**
   * How often to ping the server while otherwise idle. Half the server's
   * `Realtime:ClientTimeoutSeconds` (60s) would be enough; 15s leaves room for a lost ping.
   */
  keepAliveMs: 15_000
} as const
