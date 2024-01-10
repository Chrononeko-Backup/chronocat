import { getType } from 'mime/lite'
import { createReadStream } from 'node:fs'
import { downloadRichMedia } from '../../ipc/definitions/msgService'
import { richMediaDownloadMap } from '../../ipc/globalVars'
import type { Media } from '../../red'
import { uixCache } from '../../uixCache'
import { sleep } from '../../utils/time'
import type { RouteContext } from './types'

export const assets = async ({
  raw,
  res,
}: RouteContext & {
  raw: string
}) => {
  const data = JSON.parse(
    Buffer.from(raw, 'base64url').toString('utf-8'),
  ) as Media

  const downloadId = data.msgId + '::' + data.elementId
  console.log('DownloadId:', downloadId)
  const downloadCompletePromise = new Promise<string>((res, rej) => {
    richMediaDownloadMap[downloadId] = res
    void sleep(1000).then(rej)
  })

  if (data.chatType === 1 && !data.peerUid.startsWith('u_'))
    data.peerUid = uixCache.map[data.peerUid]!

  await downloadRichMedia({
    getReq: {
      ...data,
      downloadType: 1,
    },
  })

  let path: string | undefined = undefined

  try {
    path = await downloadCompletePromise
  } catch (e) {
    res.writeHead(404)
    res.end('404 asset not found')
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', getType(path)!)

  const readStream = createReadStream(path)
  await new Promise((resolve, reject) =>
    readStream.pipe(res).on('finish', resolve).on('error', reject),
  )
  res.end()
}
