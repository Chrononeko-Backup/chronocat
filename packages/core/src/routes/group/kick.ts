import { kickMember } from '../../ipc/definitions/groupService'
import type { GroupKickPayload } from '../../red'
import { router } from '../../router'
import { uixCache } from '../../uixCache'

router.group.kick.$body('json')(async ({ body }) => {
  const {
    uidList,
    group: groupCode,
    reason: kickReason,
    refuseForever,
  } = body as GroupKickPayload

  return await kickMember({
    groupCode,
    kickUids: uixCache.preprocessArrayOfUix(uidList),
    refuseForever,
    kickReason,
  })
})
