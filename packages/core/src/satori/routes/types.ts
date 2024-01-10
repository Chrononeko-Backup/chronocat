import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ChronocatSatoriServerConfig } from '../../config/types'

export interface RouteContext {
  config: ChronocatSatoriServerConfig
  req: IncomingMessage
  res: ServerResponse<IncomingMessage>
  buffer: () => Promise<Buffer>
  string: () => Promise<string>
  json: () => Promise<unknown>
}

export type Route = (ctx: RouteContext) => Promise<unknown>
