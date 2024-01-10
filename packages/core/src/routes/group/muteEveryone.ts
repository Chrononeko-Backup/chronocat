import { setGroupShutUp } from '../../ipc/definitions/groupService'
import type { GroupMuteEveryonePayload } from '../../red'
import { router } from '../../router'

router.group.muteEveryone.$body('json')(async ({ body }) => {
  const { group: groupCode, enable: shutUp } = body as GroupMuteEveryonePayload

  return await setGroupShutUp({
    groupCode,
    shutUp,
  })
})
