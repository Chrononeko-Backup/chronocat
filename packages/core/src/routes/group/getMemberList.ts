import {
  createMemberListScene,
  destroyMemberListScene,
  getGroupDetailInfo,
  getNextMemberList,
} from '../../ipc/definitions/groupService'
import type { GroupGetMemeberListPayload } from '../../red'
import { router } from '../../router'
import { detachPromise } from '../../utils/detachPromise'

// TODO: 首次拉取群员列表需要监听 ns-ntApi-2/nodeIKernelGroupListener/onMemberListChange

router.group.getMemberList.$body('json')(async ({ body }) => {
  const { group: groupCode, size: num } = body as GroupGetMemeberListPayload

  await getGroupDetailInfo({
    groupCode: String(groupCode),
    source: 4,
  })

  const scene = await createMemberListScene({
    groupCode,
    scene: 'groupMemberList_MainWindow',
  })

  const memList = await getNextMemberList({
    sceneId: scene,
    lastId: undefined,
    num,
  })

  await destroyMemberListScene({
    sceneId: scene,
  })

  detachPromise(
    destroyMemberListScene({
      sceneId: scene,
    }),
  )

  return memList.result?.ids?.map(({ uid, index }) => {
    return {
      index,
      detail: memList.result.infos.get(uid),
    }
  })
})
