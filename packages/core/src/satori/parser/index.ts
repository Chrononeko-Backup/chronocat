import Element from '@satorijs/element'
import { Buffer } from 'node:buffer'
import type { ChronocatSatoriEventsConfig } from '../../config/types'
import type { Message as RedMessage } from '../../red'
import { ChatType, MsgType, SendType } from '../../red'
import type { Channel, Event, Guild, GuildMember } from '../types'
import { ChannelType } from '../types'
import { parseMsgTypes } from './msgt'

export const buildParser =
  (selfId: string, config: ChronocatSatoriEventsConfig) =>
  (message: RedMessage) =>
    parseMessageRecv(selfId, config, message)

export const parseMessageRecv = async (
  self_id: string,
  config: ChronocatSatoriEventsConfig,
  message: RedMessage,
) => {
  const parsed = await parseMessage(self_id, config, message)

  if (!parsed) return undefined

  const result: Event[] = []

  for (const event of parsed) {
    if (!event.message?.id && !event.user?.id) {
      result.push({
        id: undefined as unknown as number,
        platform: config.platform!,
        self_id,
        timestamp: Number(message.msgTime) * 1000,

        type: 'chrono-unsafe-warning-2127',
      })
      continue
    } else if (!event.message?.id)
      result.push({
        id: undefined as unknown as number,
        platform: config.platform!,
        self_id,
        timestamp: Number(message.msgTime) * 1000,

        type: 'chrono-unsafe-warning-2128',
        user: {
          id: event.user?.id as string,
          name: event.user?.name as string,
        },
      })
    else if (!event.user?.id)
      result.push({
        id: undefined as unknown as number,
        platform: config.platform!,
        self_id,
        timestamp: Number(message.msgTime) * 1000,

        type: 'chrono-unsafe-warning-2129',
        user: {
          id: undefined as unknown as string,
          name: event.user?.name as string,
        },
        message: {
          id: event.message?.id,
          content: undefined as unknown as string,
        },
      })
    else if (!event.user?.name && !event.member?.name)
      result.push({
        id: undefined as unknown as number,
        platform: config.platform!,
        self_id,
        timestamp: Number(message.msgTime) * 1000,

        type: 'chrono-unsafe-warning-2130',
        user: {
          id: event.user?.id,
          name: undefined as unknown as string,
        },
        message: {
          id: event.message?.id,
          content: undefined as unknown as string,
        },
      })

    result.push(event)
  }

  return result
}

export const parseMessage = async (
  self_id: string,
  config: ChronocatSatoriEventsConfig,
  message: RedMessage,
) => {
  const event: Event = {
    id: undefined as unknown as number,
    type: undefined as unknown as string,

    platform: config.platform!,
    self_id,
    timestamp: Number(message.msgTime) * 1000,
  }

  event.user = {
    id: message.senderUin,
    name: (message.sendNickName || undefined) as unknown as string,
    avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${message.senderUin}&spec=640`,
  }

  const ntMsgTypes = parseMsgTypes(message)

  // 无论哪种消息都有 Channel 和 User
  event.channel = {} as Channel

  // 判断消息来源
  switch (ntMsgTypes.chatType) {
    case ChatType.Private:
      event.channel.type = ChannelType.DIRECT
      event.channel.id = `private:${event.user.id}`
      event.channel.name = event.user.name
      break

    case ChatType.Group:
      // Guild 和 Member 只有群聊有
      event.guild = {} as Guild
      event.member = {} as GuildMember

      if (message.sendMemberName) event.member.name = message.sendMemberName

      event.channel.type = ChannelType.TEXT
      event.channel.id = event.guild.id = message.peerUid
      event.channel.name = event.guild.name = message.peerName
      event.guild.avatar = `https://p.qlogo.cn/gh/${message.peerUid}/${message.peerUid}/640`
      break
  }

  if (
    ntMsgTypes.msgType === MsgType.Normal &&
    ntMsgTypes.subMsgType.face &&
    message.elements.some((x) => x?.faceElement?.faceType === 5)
  )
    // 窗口抖动 / 手机按钮戳一戳
    // TODO
    return undefined
  else if (
    ntMsgTypes.msgType === MsgType.Ark &&
    message.subMsgType === 0 &&
    ntMsgTypes.sendType === SendType.Normal
  )
    // ARK 卡片消息，elementType = 10
    // 不处理
    return undefined
  else if (
    ntMsgTypes.msgType === MsgType.Normal ||
    ntMsgTypes.msgType === MsgType.Value3 ||
    ntMsgTypes.msgType === MsgType.Ptt ||
    ntMsgTypes.msgType === MsgType.Video ||
    ntMsgTypes.msgType === MsgType.WithRecords ||
    ntMsgTypes.msgType === MsgType.Vaule17
  )
    return parseChatMessage(self_id, config, event, message).then((x) => [
      x[0],
      ...x[1],
    ])
  // else if (event.__CHRONO_UNSAFE_NTMSGTYPES__.subMsgType.multiForward)
  //   // 合并转发消息
  //   // multiForwardMsgElement（elementType = 16）内并不带有合并转发的全部内容，
  //   // 需要后续通过 API 再请求
  //   // 考虑到合并转发消息解析需求较少，不调度此 session
  //   return undefined
  else if (
    ntMsgTypes.msgType === MsgType.System && // 5
    message.subMsgType === 8 && // 8
    ntMsgTypes.sendType === SendType.System && // 3
    message.elements[0]!.elementType === 8 && // 8
    message.elements[0]!.grayTipElement!.subElementType === 4 && // 4
    message.elements[0]!.grayTipElement!.groupElement!.type === 1 // 1
  )
    // 新人自行入群
    return await parseGuildMemberAddedMessage(self_id, config, event, message)
  else if (
    ntMsgTypes.msgType === MsgType.System && // 5
    message.subMsgType === 8 && // 8
    ntMsgTypes.sendType === SendType.System && // 3
    message.elements[0]!.elementType === 8 && // 8
    message.elements[0]!.grayTipElement!.subElementType === 4 && // 4
    message.elements[0]!.grayTipElement!.groupElement!.type === 8 // 8
  )
    // 他人被禁言
    return await parseGuildMemberMuteMessage(self_id, config, event, message)
  else if (
    ntMsgTypes.msgType === MsgType.System && // 5
    message.subMsgType === 8 && // 8
    ntMsgTypes.sendType === SendType.System && // 3
    message.elements[0]!.elementType === 8 && // 8
    message.elements[0]!.grayTipElement!.subElementType === 4 && // 4
    message.elements[0]!.grayTipElement!.groupElement!.type === 5 // 5
  )
    // 群名称变更
    return undefined
  else if (
    ntMsgTypes.msgType === MsgType.System && // 5
    message.subMsgType === 12 && // 12
    ntMsgTypes.sendType === SendType.System && // 3
    message.elements[0]!.elementType === 8 && // 8
    message.elements[0]!.grayTipElement!.subElementType === 12 && // 12
    message.elements[0]!.grayTipElement!.xmlElement!.busiType === '1' && // 1
    message.elements[0]!.grayTipElement!.xmlElement!.busiId === '10145' // 10145
  )
    // 旧版群成员邀请新人入群
    return await parseGuildMemberAddedLegacyInviteMessage(
      self_id,
      config,
      event,
      message,
    )
  else if (
    ntMsgTypes.msgType === MsgType.System &&
    message.subMsgType === 17 &&
    ntMsgTypes.sendType === SendType.System
  )
    // 群主禁止群内临时通话
    // 群主禁止群内发起新的群聊
    return undefined

  return undefined
}

/**
 * 解析聊天消息。
 *
 * @remarks
 * 在消息没有除了消息元素以外的其他属性需要处理的情况下，直接使用此方法。
 */
async function parseChatMessage(
  self_id: string,
  config: ChronocatSatoriEventsConfig,
  event: Event,
  message: RedMessage,
) {
  const [elements, extraEvents] = await parseElements(self_id, config, message)
  event.type = 'message-created'
  event.message = {
    id: message.msgId,
    content: elements.join(''),
  }
  return [event, extraEvents] as const
}

/**
 * 解析新人自行入群消息。
 *
 * @remarks
 * 通过解析 `grayTipElement`（elementType = 8）中的
 * `groupElement`（subElementType = 4）即可直接提取 QQ 号。
 */
async function parseGuildMemberAddedMessage(
  self_id: string,
  config: ChronocatSatoriEventsConfig,
  event: Event,
  message: RedMessage,
) {
  const [event2, extraEvents] = await parseChatMessage(
    self_id,
    config,
    event,
    message,
  )
  event2.type = 'guild-member-added'

  event2.operator = {
    id: message.elements[0]!.grayTipElement!.groupElement!.adminUin!,
    name: undefined as unknown as string,
  }

  event2.user = {
    id: message.elements[0]!.grayTipElement!.groupElement!.memberUin!,
    name: message.elements[0]!.grayTipElement!.groupElement!.memberNick!,
    avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${
      message.elements[0]!.grayTipElement!.groupElement!.memberUin
    }&spec=640`,
  }

  if (event2.member) delete event2.member

  return [event2, ...extraEvents]
}

/**
 * 解析他人被禁言消息。
 */
async function parseGuildMemberMuteMessage(
  self_id: string,
  config: ChronocatSatoriEventsConfig,
  event: Event,
  message: RedMessage,
) {
  const [event2, extraEvents] = await parseChatMessage(
    self_id,
    config,
    event,
    message,
  )
  if (
    Number(message.elements[0]!.grayTipElement!.groupElement!.shutUp!.duration)
  )
    event2.type = 'chrono-unsafe-guild-mute'
  else event2.type = 'chrono-unsafe-guild-unmute'

  event2.operator = {
    id: message.elements[0]!.grayTipElement!.groupElement!.shutUp!.admin.uin,
    name: undefined as unknown as string,
  }

  event2.user = {
    id: message.elements[0]!.grayTipElement!.groupElement!.shutUp!.member.uin,
    name: message.elements[0]!.grayTipElement!.groupElement!.shutUp!.member
      .name,
    avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${
      message.elements[0]!.grayTipElement!.groupElement!.shutUp!.member.uin
    }&spec=640`,
  }

  if (event2.member) delete event2.member

  return [event2, ...extraEvents]
}

const regexGuildMemberAddedLegacyInviteMessage = /jp="(\d+)".*jp="(\d+)"/gim

/**
 * 解析旧版群成员邀请新人入群消息。使用 NT
 * 以前的客户端邀请他人加群会收到此消息。
 *
 * @remarks
 * 遗憾地，旧版群成员邀请新人入群消息不存在能够直接获取成员 QQ
 * 号的方法。需要通过解析 `grayTipElement`（elementType = 8）中的
 * `xmlElement`（subElementType = 12）中的 HTML 来提取 QQ 号。
 *
 * 一个 HTML 的示例：
 *
 * ```html
 * <gtip align="center">
 *   <qq uin="u_0gvBEjIEEOk5-EypJRjwxw" col="3" jp="1302744182" />
 *   <nor txt="邀请"/>
 *   <qq uin="u_ENIKFfFS74WSiKNoA6ERWg" col="3" jp="2953529126" />
 *   <nor txt="加入了群聊。"/>
 * </gtip>
 * ```
 *
 * 目前使用正则进行 QQ 号的提取。如果未来正则失效，则应考虑使用 cheerio
 * 进行提取。
 */
async function parseGuildMemberAddedLegacyInviteMessage(
  self_id: string,
  config: ChronocatSatoriEventsConfig,
  event: Event,
  message: RedMessage,
) {
  const [event2, extraEvents] = await parseChatMessage(
    self_id,
    config,
    event,
    message,
  )
  event2.type = 'guild-member-added'

  const execArr = regexGuildMemberAddedLegacyInviteMessage.exec(
    message.elements[0]!.grayTipElement!.xmlElement!.content!,
  )
  if (!Array.isArray(execArr) || execArr.length < 3) return undefined
  const [_, operatorId, userId] = execArr

  event2.operator = {
    id: operatorId,
    name: undefined as unknown as string,
  }

  event2.user = {
    id: userId,
    name: undefined as unknown as string,
    avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${userId}&spec=640`,
  }

  if (event2.member) delete event2.member

  return [event2, ...extraEvents]
}

/**
 * 解析消息元素。
 */
async function parseElements(
  self_id: string,
  config: ChronocatSatoriEventsConfig,
  message: RedMessage,
) {
  const elements: Element[] = []
  const extraEvents: Event[] = []

  for (const m of message.elements) {
    switch (m.elementType) {
      case 1: {
        // 文本消息
        switch (m.textElement!.atType) {
          case 0: {
            // 纯文本消息
            elements.push(Element.text(m.textElement?.content))
            break
          }

          case 2: {
            // at 消息
            const id = m.textElement!.atNtUin
            const name = m.textElement!.content.slice(1)
            if (!id) {
              extraEvents.push({
                id: undefined as unknown as number,
                platform: config.platform!,
                self_id,
                timestamp: Number(message.msgTime) * 1000,

                type: 'chrono-unsafe-warning-2131',
                user: {
                  id: undefined as unknown as string,
                  name,
                },
              })
              break
            }
            elements.push(
              Element('at', {
                id,
                name,
              }),
            )
            break
          }
        }
        break
      }

      case 2: {
        // 图片消息
        elements.push(
          Element('img', {
            src: `${config.self_url}/v1/assets/${Buffer.from(
              JSON.stringify({
                msgId: message.msgId,
                chatType: message.chatType,
                peerUid: message.peerUid,
                elementId: m.elementId,
                thumbSize: m.picElement!.thumbFileSize,
              }),
            ).toString('base64url')}`,
            'chrono-unsafe-isemoji':
              m.picElement!.picSubType === 1 || undefined,
            'chrono-unsafe-filepath': m.picElement!.sourcePath,
            'chrono-unsafe-filetype': m.picElement!.picType,
          }),
        )
        break
      }

      case 3: {
        // 文件消息
        elements.push(
          Element('file', {
            src: `${config.self_url}/v1/assets/${Buffer.from(
              JSON.stringify({
                msgId: message.msgId,
                chatType: message.chatType,
                peerUid: message.peerUid,
                elementId: m.elementId,
                thumbSize: m.fileElement!.thumbFileSize,
              }),
            ).toString('base64url')}`,
            'chrono-unsafe-filename': m.fileElement!.fileName,
          }),
        )
        break
      }

      case 4: {
        // 语音消息
        elements.push(
          Element('audio', {
            src: `${config.self_url}/v1/assets/${Buffer.from(
              JSON.stringify({
                msgId: message.msgId,
                chatType: message.chatType,
                peerUid: message.peerUid,
                elementId: m.elementId,
                thumbSize: 0,
              }),
            ).toString('base64url')}`,
            'chrono-unsafe-filepath': m.pttElement!.filePath,
            'chrono-unsafe-filename': m.pttElement!.fileName,
            'chrono-unsafe-time': m.pttElement!.duration,
            'chrono-unsafe-voice-change-type': m.pttElement!.voiceChangeType,
            'chrono-unsafe-wave-amplitudes':
              m.pttElement!.waveAmplitudes.join(),
          }),
        )
        break
      }

      case 5: {
        // 视频消息
        elements.push(
          Element('video', {
            src: `${config.self_url}/v1/assets/${Buffer.from(
              JSON.stringify({
                msgId: message.msgId,
                chatType: message.chatType,
                peerUid: message.peerUid,
                elementId: m.elementId,
                thumbSize: m.videoElement!.thumbSize,
              }),
            ).toString('base64url')}`,
            'chrono-unsafe-filepath': m.videoElement!.filePath,
            'chrono-unsafe-filename': m.videoElement!.fileName,
            'chrono-unsafe-file-format': m.videoElement!.fileFormat,
            'chrono-unsafe-time': m.videoElement!.fileTime,
          }),
        )
        break
      }

      default:
        break
    }
  }

  return [elements, extraEvents] as const
}
