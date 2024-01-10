import type { Message, MessageSendPayload } from '../red'
import { MsgType, SendType } from '../red'

export const filterMessage = (message: MessageSendPayload | Message) =>
  'peer' in message
    ? !message.elements.some((x) => x.walletElement || x.arkElement)
    : !(
        message.msgType === MsgType.Ark ||
        message.msgType === MsgType.Wallet ||
        (message.msgType === MsgType.System &&
          message.subMsgType === 17 &&
          message.sendType === SendType.System &&
          message.elements[0]!.elementType === 8 &&
          message.elements[0]!.grayTipElement!.subElementType === 16 &&
          message.elements[0]!.grayTipElement!.jsonGrayTipElement!.busiId ===
            '81')
      )
