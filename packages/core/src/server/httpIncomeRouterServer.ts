import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { createServer } from 'node:http'
import type { RouteResolver } from '../router'
import type {
  RouterServer,
  RouterServerCommonConfig,
  RouterServerInstance,
} from './abstract'

interface HttpIncomeRouterServerConfig
  extends RouterServerCommonConfig<IncomingMessage> {
  rootPath: string
  port: number
  host: string
  cors: 'all' | 'none' | string[]
  forceOk: boolean
}

export class HttpRouterServerInstance implements RouterServerInstance {
  constructor(
    resolveRoute: RouteResolver,
    {
      authorizer,
      rootPath = '/api/',
      port,
      cors,
      forceOk,
    }: Partial<HttpIncomeRouterServerConfig>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.server = createServer(async (req, res) => {
      if (cors === 'all') {
        res.setHeader('Access-Control-Allow-Origin', '*')
        // handle preflight request
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization',
          )
          res.setHeader('Access-Control-Max-Age', '86400')
          res.end()
          return
        }
      } else if (cors === 'none') {
        // do nothing
      } else if (Array.isArray(cors)) {
        if (req.headers.origin && cors.includes(req.headers.origin || '')) {
          res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
        }
      }

      const writeHead = (code: number) => res.writeHead(forceOk ? 200 : code)

      if (!req.url) {
        writeHead(400)
        res.end('404 bad request')
        return
      }
      const url = new URL(req.url, `http://${req.headers.host}`)

      if (!url.pathname.startsWith(rootPath)) {
        writeHead(404)
        res.end('404 not found')
        return
      }

      const path = url.pathname
        .slice(rootPath.length)
        .split('/')
        .filter((v) => v)

      const route = resolveRoute(path)
      if (route) {
        try {
          if (route.options.requireAuthorize && !(await authorizer!(req))) {
            writeHead(401)
            res.end('401 unauthorized')
            return
          }

          const readBodyToBuffer = (req: IncomingMessage) => {
            const chunks: Buffer[] = []
            return new Promise<Buffer>((resolve, reject) => {
              req.on('data', (chunk) => {
                chunks.push(chunk as Buffer)
              })
              req.on('end', () => {
                resolve(Buffer.concat(chunks))
              })
              req.on('error', () => {
                reject()
              })
            })
          }

          const readBodyToString = async (req: IncomingMessage) =>
            (await readBodyToBuffer(req)).toString('utf-8')

          let body: unknown
          if (route.options.body === 'binary') {
            body = await readBodyToBuffer(req)
          } else if (route.options.body === 'json') {
            body = JSON.parse(await readBodyToString(req))
          } else if (route.options.body === 'text') {
            body = await readBodyToString(req)
          }

          const ctx = {
            http: (route.options.httpOnly && {
              req,
              res,
            }) as unknown as {
              req: IncomingMessage
              res: ServerResponse
            },
            body,
          }

          const result = await route.handler(ctx)

          if (!res.writableEnded) {
            res.setHeader('Content-Type', 'application/json')
            writeHead(200)
            res.end(JSON.stringify(result))
          }
        } catch (e) {
          console.log(e)
          writeHead(500)
          res.end('500 internal server error')
        }
      } else {
        writeHead(404)
        res.end('404 not found')
      }
    })

    this.server.listen(port)
  }

  public readonly server: Server

  stop(): void {
    this.server.close()
  }
}

export const httpRouterServer: RouterServer<HttpIncomeRouterServerConfig> = {
  createServer: (resolveRoute, config) => {
    return new HttpRouterServerInstance(resolveRoute, config)
  },
}
