import { getConfig } from './config'
import { isChronocatMode } from './config/mode'
import { MessageRecvDispatchMessage } from './dispatch'
import { initHeadless3 } from './headless3'
import { initHeadless4 } from './headless4'
import { getMemberInfo } from './ipc/definitions/groupService'
import {
  friendMap,
  groupMap,
  richMediaDownloadMap,
  roleMap,
  selfProfile,
  sendCallbackMap,
  sendQueue,
} from './ipc/globalVars'
import { enableInterceptLog, initListener } from './ipc/intercept'
import type { IpcListenerData } from './ipc/types'
import { initLoginService } from './loginService'
import { getModules } from './modules'
import { setMsgCache } from './msgCache'
import type { Group, Member, Message, Profile } from './red'
import { ChatType } from './red'
import './routes'
import { sendForwardMsgBuffer } from './routes/message/sendForward'
import { initServers } from './server'
import { uixCache } from './uixCache'
import { filterMessage } from './utils/filterMessage'

declare const authData: {
  uid: string
}

declare global {
  // eslint-disable-next-line no-var
  var __CHRONO_DEBUG__: {
    uixCache: typeof uixCache
    enableInterceptLog: typeof enableInterceptLog
  }
}

const initHooks = async () => {
  try {
    const modules = await getModules()
    modules.native.performHooks()
    modules.native.setPBPreprocessorForGzHook(() => sendForwardMsgBuffer)
  } catch (e) {
    console.log('Failed to inject hooks', e)
  }
}

export const chronocat = async () => {
  if (isChronocatMode('headless3')) initHeadless3()
  if (isChronocatMode('headless4')) initHeadless4()

  if (isChronocatMode('debug') || 'CHRONO_DEBUG' in process.env)
    global.__CHRONO_DEBUG__ = {
      uixCache,
      enableInterceptLog,
    }

  void initHooks()

  if (isChronocatMode('login')) initLoginService()

  // getConfig() 包含用户配置，因此会先等待登录
  // 这是首个等待登录的位置
  // 所有在登录前就需要启动的服务均应在此之前
  const config = await getConfig()
  if (!config.enable) return

  const { dispatchMessage } = await initServers()

  const dispatch = async ({ CmdName, Payload }: IpcListenerData) => {
    try {
      uixCache.cacheObject(Payload as Record<string, unknown>)
    } catch (e) {
      // Ignore
    }

    switch (CmdName) {
      case 'nodeIKernelMsgListener/onRecvMsg': {
        const payload = Payload as {
          msgList: Message[]
        }

        const prepareRole = async (msg: Message) => {
          if (msg.chatType === ChatType.Group) {
            await getMemberInfo({
              forceUpdate: false,
              groupCode: +msg.peerUid,
              uids: [msg.senderUid],
            })
          }
        }

        const fillRole = (msg: Message) => {
          if (msg.chatType === ChatType.Group) {
            msg.roleType = roleMap[msg.peerUid]?.[msg.senderUin]
          }
        }

        const filteredPayload = await Promise.all(
          payload.msgList.filter(filterMessage).map(async (msg) => {
            await prepareRole(msg)
            msg = await uixCache.preprocessObject(msg)
            setMsgCache(msg)
            fillRole(msg)
            return msg
          }),
        )

        if (filteredPayload.length)
          dispatchMessage(new MessageRecvDispatchMessage(filteredPayload))
        return
      }

      case 'nodeIKernelProfileListener/onProfileSimpleChanged':
      case 'nodeIKernelGroupListener/onSearchMemberChange':
      case 'nodeIKernelGroupService/getNextMemberList': {
        const payload = Payload as {
          profiles: [
            string,
            {
              uin: string
            },
          ][] & {
            get: (uid: string) => Profile
          }
          infos: [
            string,
            {
              uin: string
            },
          ][]
        }

        if (payload.profiles.get(authData.uid))
          selfProfile.value = payload.profiles.get(authData.uid)

        const profile = payload.profiles ?? payload.infos
        for (const [uid, { uin }] of profile) uixCache.addToMap(uid, uin)
        return
      }

      case 'nodeIKernelGroupListener/onMemberInfoChange': {
        const { groupCode, members } = Payload as {
          groupCode: string
          dataSource: number
          members: [
            string,
            {
              uin: string
              role: number
            },
          ][] & {
            get: (uid: string) => Member
          }
        }

        for (const [uid, { uin, role }] of members) {
          uixCache.addToMap(uid, uin)
          if (!(groupCode in roleMap)) roleMap[groupCode] = {}
          roleMap[groupCode][uin] = role
        }
        break
      }

      case 'nodeIKernelGroupListener/onMemberListChange': {
        const payload = Payload as {
          info: {
            sceneId: string
            ids: unknown[]
            infos: [
              string,
              {
                uin: string
                role: number
              },
            ][] & {
              get: (uid: string) => Member
            }
          }
        }

        const groupCode = payload.info.sceneId.split('_')[0]
        if (!groupCode) break

        for (const [uid, { uin, role }] of payload.info.infos) {
          uixCache.addToMap(uid, uin)
          if (!(groupCode in roleMap)) roleMap[groupCode] = {}
          roleMap[groupCode][uin] = role
        }

        break
      }

      case 'nodeIKernelMsgListener/onRichMediaDownloadComplete': {
        const payload = Payload as {
          notifyInfo: {
            fileDownType: 1 | 2
            msgId: string
            msgElementId: string
            filePath: string
          }
        }

        const downloadId = `${payload.notifyInfo.msgId}::${payload.notifyInfo.msgElementId}`
        if (
          payload.notifyInfo.fileDownType === 1 &&
          richMediaDownloadMap[downloadId]
        ) {
          richMediaDownloadMap[downloadId]!(payload.notifyInfo.filePath)
          delete richMediaDownloadMap[downloadId]
        }
        return
      }

      case 'nodeIKernelGroupListener/onGroupListUpdate': {
        const payload = Payload as {
          groupList: Group[]
        }

        for (const group of payload.groupList) groupMap[group.groupCode] = group
        return
      }

      case 'nodeIKernelBuddyListener/onBuddyListChange': {
        const payload = Payload as {
          data: {
            categoryName: string
            buddyList: {
              category: string
              uin: string
            }[]
          }[]
        }

        for (const category of payload.data) {
          for (const buddy of category.buddyList) {
            buddy.category = category.categoryName
            friendMap[buddy.uin] = buddy
          }
        }
        return
      }

      case 'nodeIKernelMsgListener/onAddSendMsg': {
        const { msgRecord } = Payload as {
          msgRecord: Message
        }
        sendCallbackMap[msgRecord.msgId] = sendQueue.shift()!
        return
      }

      case 'nodeIKernelMsgListener/onMsgInfoListUpdate': {
        const { msgList } = Payload as {
          msgList: Message[]
        }
        for (const msg of msgList) {
          if (msg.sendStatus > 1) {
            sendCallbackMap[msg.msgId]?.(await uixCache.preprocessObject(msg))
            delete sendCallbackMap[msg.msgId]
          }
        }
        return
      }
    }
  }

  initListener(dispatch)
}
