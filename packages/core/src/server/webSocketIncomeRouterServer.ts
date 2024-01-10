import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import type { MetaConnectPayload } from '../red'
import type { Route, RouteResolver } from '../router'
import type {
  RouterServer,
  RouterServerCommonConfig,
  RouterServerInstance,
} from './abstract'

type JSONPacket = {
  type: string
  payload: JSONPayloadPacket
  echo: unknown
}

type JSONPayloadPacket = unknown

type WebSocketInitiator =
  | {
      mountHTTPServer: Server
      port?: undefined
    }
  | {
      mountHTTPServer?: undefined
      port: number
    }

type WebSocketIncomeRouterServerConfig = {
  rootPath: string
  connectPayload: () => unknown
} & RouterServerCommonConfig<MetaConnectPayload> &
  WebSocketInitiator

export class WebsocketRouterServerInstance implements RouterServerInstance {
  constructor(
    resolveRoute: RouteResolver,
    {
      authorizer,
      rootPath = '/',
      mountHTTPServer,
      port,
      connectPayload,
    }: Partial<WebSocketIncomeRouterServerConfig>,
  ) {
    this.server = new WebSocketServer({
      server: mountHTTPServer,
      port,
      path: rootPath,
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.server.on('connection', async (client) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      client.once('message', async (message) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-base-to-string
          const packet = JSON.parse(message.toString()) as JSONPacket
          const { type, payload } = packet

          if (type === 'meta::connect') {
            if (!(await authorizer!(payload as MetaConnectPayload))) {
              client.close(3000, 'Unauthorized')
              return
            }
            this.wsAuthedClients.push(client)

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            client.on('message', async (message) => {
              // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/no-unsafe-assignment
              const packet = JSON.parse(message.toString()) as JSONPacket
              if (typeof type !== 'string') return
              const path = packet.type.split('::')
              const route = resolveRoute(path)
              await this.handleRoute(route, client, packet)
            })

            client.on('close', () =>
              this.wsAuthedClients.splice(
                this.wsAuthedClients.indexOf(client),
                1,
              ),
            )

            client.send(
              JSON.stringify({
                type: 'meta::connect',
                payload: connectPayload!(),
              }),
            )
          } else if (typeof type === 'string') {
            const path = type.split('::')
            const route = resolveRoute(path)
            if (route?.options.requireAuthorize) throw Error('Authorize needed')
            else {
              await this.handleRoute(route, client, packet)
            }
          } else throw new Error('Invalid API type')
        } catch (e) {
          client.close(3000, 'Unauthorized')
        }
      })
    })
  }

  public readonly server: WebSocketServer
  public readonly wsAuthedClients: WebSocket[] = []

  async handleRoute(
    route: Route | undefined,
    client: WebSocket,
    packet: JSONPacket,
  ) {
    const reply = (payload: unknown) =>
      client.send(
        JSON.stringify({
          type: `${route?.path.join('::')}::reply`,
          payload,
          echo: packet.echo,
        }),
      )
    if (route) {
      const { payload } = packet
      if (route.options.httpOnly)
        return reply({
          error: 'route not supported',
          reason: 'This route is http only',
        })

      if (route.options.body === 'binary')
        return reply({
          error: 'route not supported',
          reason: 'Binary body is not supported for websocket',
        })

      if (route.options.body === 'json') {
        if (typeof payload !== 'object')
          return reply({
            error: 'invalid payload',
            reason: 'Payload must be an object for this route',
          })
      }

      if (route.options.body === 'text') {
        if (typeof payload !== 'string')
          return reply({
            error: 'invalid payload',
            reason: 'Payload must be a string for this route',
          })
      }

      const ctx = {
        body: payload,
        http: undefined as unknown as {
          req: IncomingMessage
          res: ServerResponse
        },
      }

      try {
        const result = await route.handler(ctx)
        reply(result)
      } catch (e) {
        console.error(e)
        reply({
          error: 'internal error',
          reason: 'Internal error occurred',
        })
      }
    } else {
      reply({
        error: 'route error',
        reason: 'Route not found',
      })
    }
  }

  broadcast(type: string, payload: unknown): void {
    this.wsAuthedClients.forEach((c) =>
      c.send(
        JSON.stringify({
          type,
          payload,
        }),
      ),
    )
  }

  stop(): void {
    this.server.close()
  }
}

export const wsRouterServer: RouterServer<WebSocketIncomeRouterServerConfig> = {
  createServer: (resolveRoute, config) => {
    return new WebsocketRouterServerInstance(resolveRoute, config)
  },
}
