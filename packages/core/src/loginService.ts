import type { IpcMain, WebContents } from 'electron'
// eslint-disable-next-line import/no-unresolved
import { BrowserWindow, app } from 'electron'
import index from '../static/login.html'
import loginJs from '../static/login.js.txt'
import { wrapIpc } from './ipc/wrap'
import { resolveRouteLogin, routerLogin } from './router'
import { HeaderAuthorizer } from './server/authorizer'
import { httpRouterServer } from './server/httpIncomeRouterServer'
import { getAuthData } from './utils/authData'
import { sleep } from './utils/time'
import { generateToken } from './utils/token'
import { isChronocatMode } from './config/mode'

interface QuickLoginAccount {
  name: string
  id: string
}

interface LoginState {
  qrcode?: string | null
  quickLoginAccounts?: QuickLoginAccount[] | null
}

type LoginIpcP2 = [
  | {
      type: 'quickloginList'
      data: QuickLoginAccount[]
    }
  | {
      type: 'qrcode'
      data: string
    }
  | {
      type: 'quickloginError'
      data: never
    }
  | {
      type: 'error'
      data: unknown
    },
]

const loginState: LoginState = {}

export const initLoginService = () => {
  try {
    const listen =
      app.commandLine.getSwitchValue('chrono-admin-listen') ||
      process.env['CHRONO_ADMIN_LISTEN'] ||
      '0.0.0.0:16340'

    const token =
      app.commandLine.getSwitchValue('chrono-admin-token') ||
      app.commandLine.getSwitchValue('chrono-default-token') ||
      process.env['CHRONO_ADMIN_TOKEN'] ||
      process.env['CHRONO_DEFAULT_TOKEN'] ||
      generateToken()

    let [host, port] = listen.split(':')
    if (!port) {
      port = host
      host = '0.0.0.0'
    }

    console.log(
      `访问此链接以登录：\nhttp://127.0.0.1:${port}/login#127.0.0.1:${port}@${token}`,
    )

    const server = httpRouterServer.createServer(resolveRouteLogin, {
      authorizer: HeaderAuthorizer(token),
      rootPath: '/login',
      port: parseInt(port),
      host,
      cors: 'all',
    })

    app.on('browser-window-created', (_event, window) => {
      window.webContents.on('did-finish-load', () => {
        runScriptInRenderer(window.webContents, loginJs)
      })
    })

    void sleep(3000).then(() => runScriptInAllRenderers(loginJs))

    wrapIpc<LoginIpcP2>(
      (emit) =>
        function (this: IpcMain, eventName, ...p) {
          try {
            const pEvent = p[1]
            const p2 = p[2]

            if (pEvent?.eventName === 'chronocat') {
              const { type, data } = p2![0]

              switch (type) {
                case 'quickloginList': {
                  loginState.quickLoginAccounts = data
                  if (
                    loginState.quickLoginAccounts?.length &&
                    isChronocatMode('autologin')
                  )
                    runScriptInAllRenderers(
                      `quickLogin('${loginState.quickLoginAccounts[0].id}')`,
                    )
                  loginState.qrcode = null
                  break
                }
                case 'qrcode': {
                  loginState.qrcode = data
                  loginState.quickLoginAccounts = null
                  break
                }
                case 'quickloginError': {
                  loginState.quickLoginAccounts = null
                  loginState.qrcode = null
                  break
                }
                case 'error': {
                  console.log('quickLogin error: ', data)
                  break
                }
              }

              return true
            }
          } catch (e) {
            console.error(e)
          }

          return emit.call(this, eventName, ...p)
        },
    )

    void getAuthData().then(() => {
      server.stop()
      console.warn('Chronocat login service stopped due to authorization')
    })
  } catch (e) {
    console.log('login service: ', e)
  }
}

const runScriptInRenderer = (
  renderer: BrowserWindow | WebContents,
  script: string,
) =>
  // use javascript: protocol to run script in renderer
  void renderer.loadURL(`javascript:eval(decodeURI(\`${encodeURI(script)}\`))`)

const runScriptInAllRenderers = (script: string) => {
  for (const renderer of BrowserWindow.getAllWindows()) {
    runScriptInRenderer(renderer, script)
  }
}

routerLogin.available.$requireAuthorize(false)(() => 'true')

routerLogin.states(() => loginState)

routerLogin.qrcode(() => {
  if (!loginState) return null
  if (loginState.qrcode) return loginState.qrcode
  runScriptInAllRenderers('getQRCode()')
  return 'pending'
})

routerLogin.quickLogin.$body('json')(({ body }) => {
  const { id } = body as { id: string }
  runScriptInAllRenderers(`quickLogin('${parseInt(id)}')`)
})

routerLogin.$requireAuthorize(false).$httpOnly('GET')(({ http }) => {
  http.res.writeHead(200, {
    'Content-Type': 'text/html; charset=UTF-8',
    'Cache-Control': 'no-cache',
    'Content-Length': index.byteLength,
  })
  http.res.end(index)
})
