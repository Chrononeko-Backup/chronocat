import type { IpcMain } from 'electron'

export type Uuid = string | number

/**
 * 包含了单个 IPC 消息内的所有内容，供
 * requestMap 使用。Chronocat 内部使用。
 */
export interface IpcInfo {
  Full: IpcP
  EventName: string
  Method: string | undefined
  Args: unknown[] | undefined
  Channel: string
}

/**
 * IPC 的 emit 方法，供 wrapIpc 使用。
 */
export type IpcEmit<D = IpcP2> = (
  this: IpcMain,
  eventName: string | symbol,
  ...p: IpcP<D>
) => boolean

/**
 * IPC 扩展参数。
 */
export type IpcP<D = IpcP2> = [p0: IpcP0, pEvent: IpcEvent, p2: D | undefined]

/**
 * IPC 参数 2（Args）。QQ 使用。
 */
export type IpcP2 = [method: string, payload: unknown]

/**
 * {@link IpcP0} 内存在的 send 方法。QQ 使用。
 */
export type IpcSender = (
  channel: string,
  evt: IpcEvent,
  detail: IpcDetail,
) => void

/**
 * IPC 消息的参数，包含了 sender 对象。QQ 使用。
 */
export interface IpcP0 {
  sender: {
    send: IpcSender
    __CHRONO_HOOKED__: boolean
  }
}

/**
 * IPC 由后端向前端发送的事件。QQ 使用。
 */
export interface IpcEvent {
  eventName: string
  callbackId: Uuid
}

/**
 * IPC 由后端向前端发送的事件详情。QQ 使用。
 */
export type IpcDetail = [
  {
    cmdName: string
    payload: unknown
  },
]

/**
 * IPC 由后端向前端发送的事件，供 Chronocat Dispatcher
 * 使用。Chronocat 内部使用。
 */
export interface IpcListenerData {
  Full: [channel: string, evt: IpcEvent, detail: IpcDetail]
  EventName: string
  CmdName: string
  Payload: unknown
  Request: IpcInfo
}
