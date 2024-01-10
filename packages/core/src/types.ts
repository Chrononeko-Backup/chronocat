import type { IncomingMessage, ServerResponse } from 'node:http'

export interface MemoryStoreItem {
  args: unknown[]
  expires: number
}

export interface Context {
  baseDir: string
  req?: IncomingMessage
  res?: ServerResponse
  getBody: () => Promise<unknown>
}
