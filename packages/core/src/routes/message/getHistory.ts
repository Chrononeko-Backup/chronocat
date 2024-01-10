import { getMsgsIncludeSelf } from '../../ipc/definitions/msgService'
import type { MessageGetHistoryPayload } from '../../red'
import { router } from '../../router'
import { uixCache } from '../../uixCache'

router.message.getHistory.$body('json')(async ({ body }) => {
  const { peer, offsetMsgId, count } = body as MessageGetHistoryPayload

  return await uixCache.preprocessObject(
    await getMsgsIncludeSelf({
      peer: await uixCache.preprocessObject(peer),
      msgId: offsetMsgId!,
      cnt: count,
      queryOrder: true,
    }),
  )
})
