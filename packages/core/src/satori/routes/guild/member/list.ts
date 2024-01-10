import {
  createMemberListScene,
  destroyMemberListScene,
  getGroupDetailInfo,
  getNextMemberList,
} from '../../../../ipc/definitions/groupService'
import { detachPromise } from '../../../../utils/detachPromise'
import type {
  GuildMember,
  GuildMemberListPayload,
  GuildMemberListResponse,
} from '../../../types'
import type { RouteContext } from '../../types'

export const guildMemberList = async ({
  json,
}: RouteContext): Promise<GuildMemberListResponse> => {
  const { guild_id } = (await json()) as GuildMemberListPayload

  await getGroupDetailInfo({
    groupCode: String(guild_id),
    source: 4,
  })

  const scene = await createMemberListScene({
    groupCode: Number(guild_id),
    scene: 'groupMemberList_MainWindow',
  })

  const memList = await getNextMemberList({
    sceneId: scene,
    lastId: undefined,
    num: 50,
  })

  await destroyMemberListScene({
    sceneId: scene,
  })

  detachPromise(
    destroyMemberListScene({
      sceneId: scene,
    }),
  )

  return {
    data: memList.result?.ids
      ?.map(({ uid }) => {
        const detail = memList.result?.infos?.get(uid)
        if (!detail) return undefined

        const guildMember: GuildMember = {
          user: {
            id: detail.uin,
            name: detail.nick,
            avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${detail.uin}&spec=640`,
          },
        }
        if (detail.cardName) guildMember.name = detail.cardName

        return guildMember
      })
      .filter(
        Boolean as unknown as (x: GuildMember | undefined) => x is GuildMember,
      ),
  }
}
