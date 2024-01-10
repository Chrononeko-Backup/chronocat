import Element from '@satorijs/element'
import type { Object } from 'ts-toolbelt'
import type { Common } from '../common'
import type { ChronocatSatoriServerConfig } from '../config/types'
import { MessageRecvDispatchMessage } from '../dispatch'
import type { Peer, Element as RedElement } from '../red'
import { ChatType, r } from '../red'
import type { Message } from './types'

class State {
  constructor(public type: 'message') {}
}

export class Messager {
  constructor(
    public selfId: string,
    public config: ChronocatSatoriServerConfig,
    public common: Common,
    public channelId: string,
  ) {
    this.peer = this.channelId.startsWith('private:')
      ? {
          chatType: ChatType.Private,
          peerUin: this.channelId.slice(8), // private:
        }
      : {
          chatType: ChatType.Group,
          peerUin: this.channelId,
          guildId: '',
        }
  }

  peer: Partial<Peer>

  public errors: Error[] = []
  public results: Message[] = []

  stack: State[] = [new State('message')]
  children: Object.Partial<RedElement, 'deep'>[] = []

  prepare = async () => {}

  render = async (elements: Element[], flush?: boolean) => {
    for (const element of elements) await this.visit(element)
    if (flush) await this.flush()
  }

  async send(content: Element.Fragment) {
    await this.prepare()
    const elements = Element.normalize(content)
    await this.render(elements)
    await this.flush()

    if (this.errors.length) throw this.errors
    else return this.results.filter(Boolean) // .map(({ id }) => ({ id }))
  }

  flush = async () => {
    if (!this.children.length) return

    const result = await this.common.send(this.peer, this.children)
    const parsedEvents = await new MessageRecvDispatchMessage([
      result,
    ]).toSatori(this.selfId, this.config)
    for (const parsedEvent of parsedEvents)
      if (parsedEvent.message) this.results.push(parsedEvent.message)
    this.children = []
  }

  visit = async (element: Element) => {
    const { type, attrs, children } = element

    switch (type) {
      case 'text': {
        // 文本消息
        this.children.push(r.text(attrs['content'] as string))
        return
      }

      case 'img': {
        // 图片消息
        const urlString = attrs['src'] as string
        const result = await this.common.save(urlString)

        let picType: number
        switch (result.imageInfo?.type) {
          case 'png': {
            picType = 1001
            return
          }

          case 'gif': {
            picType = 2000
            return
          }

          default: {
            picType = 1000
            break
          }
        }

        this.children.push(r.remoteImage(result, picType))
        return
      }

      case 'audio': {
        // 语音消息
        const urlString = attrs['src'] as string
        const result = await this.common.save(urlString)
        this.children.push(
          r.remoteAudio(
            result,
            (attrs['chrono-unsafe-time'] as number | undefined) || 1,
          ),
        )
        return
      }

      case 'file': {
        // 文件消息
        const urlString = attrs['src'] as string
        const result = await this.common.save(urlString)
        this.children.push(r.remoteFile(result))
        return
      }

      case 'at': {
        // at 消息
        if (attrs['type'] === 'all') {
          this.children.push(r.at('全体成员', 'all'))
        } else {
          this.children.push(
            r.at(attrs['name'] as string, attrs['id'] as string),
          )
        }

        return
      }

      case 'message': {
        // 前面的消息直接发送，开始一条新消息
        await this.flush()

        if ('forward' in attrs) {
          // TODO: 合并转发
          // this.stack.unshift(new State('forward'))
          // await this.render(children)
          // await this.flush()
          // this.stack.shift()
          // await this.forward()
        } else {
          // 普通切割消息
          await this.render(children, true)
        }
        return
      }

      default: {
        // 兜底
        await this.render(children)
        return
      }
    }
  }
}
