import { getType } from 'mime/lite'
import { createReadStream } from 'node:fs'
import { downloadRichMedia } from '../../ipc/definitions/msgService'
import { richMediaDownloadMap } from '../../ipc/globalVars'
import type { Media } from '../../red'
import { router } from '../../router'
import { uixCache } from '../../uixCache'
import { sleep } from '../../utils/time'

router.message.fetchRichMedia.$body('json').$httpOnly(true)(
  async ({ body, http }) => {
    let { msgId, elementId, chatType, peerUid } = body as Media

    const downloadId = msgId + '::' + elementId
    const downloadCompletePromise = new Promise<string>((res, rej) => {
      richMediaDownloadMap[downloadId] = res
      void sleep(1000).then(rej)
    })

    if (chatType === 1 && !peerUid.startsWith('u_'))
      peerUid = uixCache.map[peerUid]!

    await downloadRichMedia({
      getReq: {
        msgId,
        chatType,
        peerUid,
        elementId,
        thumbSize: 0,
        downloadType: 1,
      },
    })

    let path: string | undefined = undefined

    try {
      path = await downloadCompletePromise
    } catch (e) {
      http.res.writeHead(404)
      http.res.end('404 asset not found')
      return
    }

    http.res.statusCode = 200
    http.res.setHeader('Content-Type', getType(path)!)

    const readStream = createReadStream(path)
    await new Promise((resolve, reject) =>
      readStream.pipe(http.res).on('finish', resolve).on('error', reject),
    )
    http.res.end()
  },
)
