import { common } from '../../common'
import type { MessageSendPayload } from '../../red'
import { router } from '../../router'
import { filterMessage } from '../../utils/filterMessage'
import { makeFullPacket } from '../../utils/packetHelper'

router.message.send.$body('json')(async ({ body }) => {
  const payload = body as MessageSendPayload

  if (!filterMessage(payload)) return {}

  makeFullPacket(payload as unknown as Record<string, unknown>)

  return common.send(payload.peer, payload.elements)
})
