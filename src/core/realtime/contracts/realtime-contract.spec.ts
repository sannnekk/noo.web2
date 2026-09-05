import { describe, expect, test } from 'vitest'
import contract from '../../../../realtime-contract.json'
import { NotificationHubEvents } from './notification.contract'
import { PingHubEvents } from './ping.contract'

/**
 * `realtime-contract.json` is generated and verified on the API side, then vendored here the way
 * `openapi.yaml` is. A renamed hub method is otherwise invisible: the server pushes a name
 * nobody listens for, and nothing errors — no 404, no rejected promise, just a message that
 * quietly stops arriving.
 *
 * When this fails, copy `src/Noo.Api/realtime-contract.json` from api-3.0 and update the
 * contracts below to match.
 */
const declared: Record<string, readonly string[]> = {
  INotificationHubClient: Object.values(NotificationHubEvents),
  IRealtimePingClient: Object.values(PingHubEvents)
}

describe('realtime contract', () => {
  test('declares a TypeScript contract for every hub the API exposes', () => {
    const serverClients = contract.Hubs.map((hub) => hub.Client).sort()

    expect(Object.keys(declared).sort()).toEqual(serverClients)
  })

  test.each(contract.Hubs)(
    'covers every method of $Client',
    ({ Client, Methods }) => {
      const declaredMethods = declared[Client] ?? []

      for (const method of Methods) {
        expect(declaredMethods).toContain(method.Name)
      }
    }
  )

  test.each(contract.Hubs)(
    'declares no method $Client does not have',
    ({ Client, Methods }) => {
      const serverMethods = Methods.map((method) => method.Name)

      for (const declaredMethod of declared[Client] ?? []) {
        expect(serverMethods).toContain(declaredMethod)
      }
    }
  )
})
