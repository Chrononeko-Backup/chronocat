import type { IpcMain } from 'electron'
import { isChronocatMode } from '../config/mode'
import { requestCallbackMap, requestMap, responseMap } from './globalVars'
import type { IpcInfo, IpcListenerData, IpcP } from './types'
import { wrapIpc } from './wrap'

export const enableInterceptLog = {
  enable: false,
}

export const initListener = (
  listener: (data: IpcListenerData) => void | Promise<void>,
) => {
  let i = 1

  wrapIpc(
    (emit) =>
      function (this: IpcMain, eventName: string | symbol, ...p: IpcP) {
        const p0 = p[0]
        const pEvent = p[1]
        const p2 = p[2]

        const sender = p0.sender
        if (!sender.__CHRONO_HOOKED__) {
          const send = sender.send.bind(sender)
          sender.__CHRONO_HOOKED__ = true

          sender.send = function (channel, evt, detail) {
            void listener({
              Full: [channel, evt, detail],
              EventName: evt.eventName,
              CmdName: detail?.[0]?.cmdName,
              Payload: detail?.[0]?.payload,
              Request: requestMap[evt.callbackId],
            })

            send.call(this, channel, evt, detail)

            if (evt.callbackId) {
              const uuid = evt.callbackId

              if (requestCallbackMap[uuid]) {
                requestCallbackMap[uuid]?.call(evt, detail)
              }

              if (responseMap[evt.callbackId])
                responseMap[evt.callbackId].resolved = detail

              if (enableInterceptLog.enable)
                console.log(
                  `%c${i++}%cChronocat%cResponse%c${
                    requestMap[evt.callbackId]!.EventName
                  }/${requestMap[evt.callbackId]!.Method}`,
                  'background:#6ff;color:black;padding: 2px 4px;',
                  'background:#111;color:white;padding: 2px 8px;',
                  'background:#292;color:white;padding: 2px 8px;',
                  'background:#555;color:white;padding: 2px 8px;',
                  requestMap[evt.callbackId]!.Args?.[1],
                  detail,
                )
            } else {
              if (enableInterceptLog.enable)
                if (evt.eventName !== 'BQQNT_IPC_inspector:log')
                  console.log(
                    `%c${i++}%cChronocat%cEvent%c${evt.eventName}/${
                      detail[0]!.cmdName
                    }`,
                    'background:#6ff;color:black;padding: 2px 4px;',
                    'background:#111;color:white;padding: 2px 8px;',
                    'background:#229;color:white;padding: 2px 8px;',
                    'background:#555;color:white;padding: 2px 8px;',
                    detail[0]?.payload,
                  )
            }
            delete requestMap[evt.callbackId]
          }
        }

        const ipcInfo: IpcInfo = {
          Full: p,
          EventName: pEvent?.eventName,
          Method: p2?.[0],
          Args: p2,
          Channel: eventName as string,
        }

        if (isChronocatMode('headless1')) {
          // 无头模式（模式 1）下屏蔽 unregister 事件
          if (!pEvent?.eventName.toLowerCase().includes('unregister'))
            emit.call(this, eventName, ...p)
        } else {
          // 非无头模式，不做修改
          emit.call(this, eventName, ...p)
        }

        if (pEvent?.eventName?.includes('Log')) return false
        responseMap[pEvent?.callbackId] ??= {}
        requestMap[pEvent?.callbackId] = ipcInfo

        if (enableInterceptLog.enable)
          console.debug(
            `%c${i++}%cChronocat%cRequest%c${ipcInfo.EventName}/${p2?.[0]}`,
            'background:#6ff;color:black;padding: 2px 4px;',
            'background:#111;color:white;padding: 2px 8px;',
            'background:#922;color:white;padding: 2px 8px;',
            'background:#555;color:white;padding: 2px 8px;',
            p2?.[1],
          )

        return false
      },
  )
}
