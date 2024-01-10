import type { Message, Peer } from './red'

const privateCache: Record<string, Message> = {}
const groupCache: Record<string, Message> = {}

export const setMsgCache = (message: Message) => {
  switch (message.chatType) {
    case 1:
      if (message.senderUin) privateCache[message.senderUin] = message
      return
    case 2:
      if (message.peerUid) groupCache[message.peerUid] = message
      return
  }
}

export const getMsgCache = (peer: Peer) =>
  peer.chatType === 1 ? privateCache[peer.peerUin] : groupCache[peer.peerUin]
