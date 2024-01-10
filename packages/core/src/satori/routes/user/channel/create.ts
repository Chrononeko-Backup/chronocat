import type { UserChannelCreatePayload } from '../../../types'
import type { RouteContext } from '../../types'

export const userChannelCreate = async ({ json }: RouteContext) => {
  const { user_id } = (await json()) as UserChannelCreatePayload

  return `private:${user_id}`
}
