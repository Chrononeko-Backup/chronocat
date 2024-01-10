import fetch from 'node-fetch'
import type { ChronocatSatoriWebHookConfig } from '../config/types'
import type { DispatchMessage } from '../dispatch'
import { getAuthData } from '../utils/authData'
import { buildEventIdCounter } from '../utils/token'

export const initSatoriWebHook = async (
  config: ChronocatSatoriWebHookConfig,
) => {
  // 预处理 self_url
  if (!config.self_url || config.self_url === 'https://chronocat.vercel.app')
    config.self_url = `http://127.0.0.1:5500`
  if (config.self_url.endsWith('/'))
    config.self_url = config.self_url.slice(0, config.self_url.length - 1)

  const getId = buildEventIdCounter()

  const dispatcher = async (message: DispatchMessage) => {
    await message.toSatori((await getAuthData()).uin, config).then((events) =>
      events.forEach((data) => {
        const body = {
          ...data,
          id: getId(),
        }

        const headers: HeadersInit = {}
        if (config.token) headers['Authorization'] = `Bearer ${config.token}`

        void fetch(config.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      }),
    )
  }

  return {
    dispatcher,
  }
}
