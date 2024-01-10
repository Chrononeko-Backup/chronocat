// eslint-disable-next-line import/no-unresolved
import type { BrowserWindowConstructorOptions } from 'electron'
// https://github.com/import-js/eslint-plugin-import/issues/2802
// eslint-disable-next-line import/no-unresolved
import { app, BrowserWindow } from 'electron'
import { setFlagsFromString } from 'node:v8'
import { runInNewContext } from 'node:vm'

declare global {
  // eslint-disable-next-line no-var
  var authData: {
    uid: string
  }
}

export const initHeadless4 = () => {
  try {
    setFlagsFromString('--expose_gc')

    // 5 秒一 gc
    const gc = runInNewContext('gc') as () => void

    setInterval(() => {
      gc()
    }, 5000)

    app.quit = () => {}

    app.commandLine.appendSwitch('disable-software-rasterizer')
    app.commandLine.appendSwitch('disable-gpu')

    if (!app.isReady) app.disableHardwareAcceleration()

    let handleClearWindowsTimer: NodeJS.Timeout | undefined = undefined

    const FakeBrowserWindow = new Proxy(BrowserWindow, {
      construct(
        _target: typeof BrowserWindow,
        args: [BrowserWindowConstructorOptions],
      ) {
        args[0].width = 3
        args[0].height = 3
        // console.log('[headless] ConstructBW', args[0])

        if (!args[0].title && !handleClearWindowsTimer) {
          app.removeAllListeners('window-all-closed')
          handleClearWindowsTimer = setInterval(() => {
            if (!globalThis.authData) return

            setTimeout(() => {
              BrowserWindow.getAllWindows().forEach((v) => {
                v.removeAllListeners()

                // v.close()

                try {
                  // @ts-expect-error BaseWindow 没有 dts
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
                  require('electron').BaseWindow.prototype.destroy.call(v)
                } catch (e) {
                  console.log('headless3: destroy failed: ', e)
                }
              })
            }, 5000)
          }, 5000)
        }

        type BWKeys = Exclude<keyof BrowserWindow, 'id' | 'webContents'>
        type BWFunctions = BrowserWindow[BWKeys]

        const win = new BrowserWindow(...args)
        const winOriginMethods = {} as Record<BWKeys, BWFunctions>

        for (const i in win) {
          const ii = i as BWKeys

          if (typeof win[ii] === 'function') {
            winOriginMethods[ii] = win[ii] as () => void // .bind(win)

            win[ii] = ((...args: unknown[]) => {
              // console.log('[headless3] win called ', ii, args)
              if (ii === 'isDestroyed') {
                // console.log(
                //   '[headless3] win called isDestroyed ',
                //   new Error().stack,
                // )
                return false
              }

              return (
                winOriginMethods[ii] as (...p: unknown[]) => unknown
              ).apply(win, args)
            }) as never
          }
        }

        win.webContents.setFrameRate(1)
        win.webContents.on('paint', ({ preventDefault }) => preventDefault())
        win.setSize = () => {}
        win.setMinimumSize = () => {}
        win.setMaximumSize = () => {}
        win.setPosition = () => {}
        win.show = () => {}
        return win
      },
    })

    type ModuleLoad = (
      request: string,
      parent: unknown,
      isMain: boolean,
    ) => object

    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    const originLoad = require('module')._load as ModuleLoad

    const newLoad: ModuleLoad = (request, parent, isMain) => {
      if (request === 'electron') {
        return {
          ...originLoad(request, parent, isMain),
          BrowserWindow: FakeBrowserWindow,
        }
      }
      return originLoad(request, parent, isMain)
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    require('module')._load = newLoad
  } catch (e) {
    console.log('headless3: ', e)
  }
}
