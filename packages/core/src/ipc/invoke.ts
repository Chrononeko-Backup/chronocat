// https://github.com/import-js/eslint-plugin-import/issues/2802
// eslint-disable-next-line import/no-unresolved
import { ipcMain } from 'electron'
import { timeout } from '../utils/time'
import { requestCallbackMap } from './globalVars'
import type { IpcDetail, IpcEvent } from './types'

const generateUUID = () => {
  let d = new Date().getTime()
  d += performance.now()

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export const invoke = async (
  channel: string,
  evtName: unknown,
  ...args: unknown[]
) => {
  const uuid = generateUUID()
  const result = await Promise.race([
    new Promise((_, reject) => setTimeout(() => reject(), timeout)),
    new Promise((resolve) => {
      requestCallbackMap[uuid] = resolve
      ipcMain.emit(
        channel,
        {
          sender: {
            send: (...args: [string, IpcEvent, IpcDetail]) => {
              resolve(args)
            },
            __CHRONO_HOOKED__: true,
          },
        },
        { type: 'request', callbackId: uuid, eventName: evtName },
        args,
      )
    }),
  ])

  delete requestCallbackMap[uuid]

  return result
}

export type Invoke = typeof invoke
