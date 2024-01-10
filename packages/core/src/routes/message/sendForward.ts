import type { msg } from 'miraigo'
import miraigo from 'miraigo'
import type { Root } from 'protobufjs/light'
import { multiForwardMsgWithComment } from '../../ipc/definitions/msgService'
import { sendQueue } from '../../ipc/globalVars'
import { getMsgCache } from '../../msgCache'
import type { UnsafeMessageSendForwardPayload } from '../../red'
import { router } from '../../router'
import { uixCache } from '../../uixCache'
import { detachPromise } from '../../utils/detachPromise'
import { sleep, timeout } from '../../utils/time'

const PbMultiMsgTransmit = (miraigo as unknown as Root).lookupType(
  'msg.PbMultiMsgTransmit',
) as unknown as typeof msg.PbMultiMsgTransmit

const defaultSendForwardCover = '（Chronocat 合并转发消息）'

export let sendForwardMsgBuffer = Buffer.alloc(0)
export let sendForwardCover = defaultSendForwardCover

let task = Promise.resolve<unknown>(undefined)

router.message.unsafeSendForward.$body('json')(async ({ body }) => {
  const payload = body as UnsafeMessageSendForwardPayload

  const srcContact = await uixCache.preprocessObject(payload.srcContact)
  const dstContact = await uixCache.preprocessObject(payload.dstContact)
  let msgInfos = undefined as unknown as {
    msgId: string
    senderShowName: string
  }[]
  let msgBuffer = Buffer.alloc(0)
  let cover = defaultSendForwardCover

  if (!payload.msgInfos && !payload.msgElements)
    throw new Error('message body not found')
  else if (payload.msgInfos && payload.msgElements)
    throw new Error('msgInfos OR msgElements are accepted, not both')
  else if (payload.msgInfos) {
    // 普通合并转发
    msgInfos = payload.msgInfos
  } else {
    // 伪造合并转发
    const lastMsg = getMsgCache(srcContact)
    if (!lastMsg) throw new Error('send a message first')

    msgInfos = [
      {
        msgId: lastMsg.msgId,
        senderShowName: 'CHRONO_FAKEFORWARD',
      },
    ]

    processElements(payload.msgElements!)

    msgBuffer = Buffer.from(
      PbMultiMsgTransmit.encode(
        PbMultiMsgTransmit.create({
          pbItemList: [
            {
              fileName: 'MultiMsg',
              buffer: {
                msg: payload.msgElements!,
              },
            },
          ],
        }),
      ).finish(),
    )

    if (payload.cover) {
      msgInfos[0]!.senderShowName += '_WITHCOVER'
      cover = payload.cover
    }
  }

  task = task
    .then(() => sleep(80))
    .then(
      () =>
        new Promise((resolve, reject) => {
          sendForwardMsgBuffer = msgBuffer
          sendForwardCover = cover

          sendQueue.push(resolve)

          detachPromise(
            multiForwardMsgWithComment({
              msgInfos,
              srcContact,
              dstContact,
              commentElements: [],
            }),
          )

          setTimeout(() => {
            const index = sendQueue.indexOf(resolve)
            if (index >= 0) {
              sendQueue.splice(index, 1)
              reject()
            }
          }, timeout)
        }),
    )
    .catch((e) => console.log(e))

  return await task
})

function processElements(elements: msg.IMessage[]) {
  for (const element of elements)
    if (Number(element.head!.field2))
      element.head!.field2 = (uixCache.map[element.head!.field2!] ||
        element.head!.field2) as string
}
