import type { IncomingMessage } from 'node:http'
import type { MetaConnectPayload } from '../red'

export const HeaderAuthorizer = (token: string) => (req: IncomingMessage) =>
  req.headers.authorization?.slice(0, 7) === 'Bearer ' &&
  req.headers.authorization.slice(7) === token

export const PayloadAuthorizer =
  (token: string) => (payload: MetaConnectPayload) =>
    payload.token === token
