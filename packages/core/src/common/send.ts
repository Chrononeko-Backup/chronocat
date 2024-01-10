import type { Object } from 'ts-toolbelt'
import { sendMsg } from '../ipc/definitions/msgService'
import { sendQueue } from '../ipc/globalVars'
import type { Element, Message, Peer } from '../red'
import { uixCache } from '../uixCache'
import { detachPromise } from '../utils/detachPromise'
import { timeout } from '../utils/time'

export const commonSend = async (
  peer: Partial<Peer>,
  elements: Object.Partial<Element, 'deep'>[],
) => {
  const param = {
    msgId: '0',
    msgAttributeInfos: new Map(),
    peer: (await uixCache.preprocessObject(peer)) as Peer,
    msgElements: await uixCache.preprocessObject(elements, {
      contextGroup: peer.chatType === 2 ? Number(peer.peerUin) : undefined,
    }),
  } as const

  return new Promise<Message>((resolve, reject) => {
    sendQueue.push(resolve)
    detachPromise(sendMsg(param))
    setTimeout(() => {
      const index = sendQueue.indexOf(resolve)
      if (index >= 0) {
        sendQueue.splice(index, 1)
        reject()
      }
    }, timeout)
  })
}
