import busboy from 'busboy'
import { randomFillSync } from 'crypto'
import { createWriteStream } from 'node:fs'
import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'path'
import { common } from '../../../common'
import {
  getFileMd5,
  getFileSize,
  getFileType,
  getImageSizeFromPath,
} from '../../../ipc/definitions/fsApi'
import {
  getRichMediaFilePath,
  getRichMediaFilePathForGuild,
} from '../../../ipc/definitions/msgService'
import { getAuthData } from '../../../utils/authData'
import { baseDir } from '../../../utils/baseDir'
import { qqVersion } from '../../../utils/qqVersion'
import { Messager } from '../../messager'
import type { MessageCreatePayload } from '../../types'
import type { RouteContext } from '../types'

export const messageCreate = async (ctx: RouteContext) => {
  let useForm = false
  const contentType = ctx.req.headers['content-type']
  if (contentType) {
    if (contentType.startsWith('application/x-www-form-urlencoded'))
      useForm = true
    if (contentType.startsWith('multipart/form-data')) useForm = true
  }

  if (useForm) return messageCreateUsingForm(ctx)
  else return messageCreateUsingJson(ctx)
}

async function messageCreateUsingForm({ req, res }: RouteContext) {
  res.writeHead(500)
  res.end('500 not')

  return

  // @ts-expect-error TODO
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers })

    let f:
      | Promise<{
          filePath: string
          fileInfo: busboy.FileInfo
        }>
      | undefined

    bb.on('error', reject)

    bb.on('file', (_name, file, info) => {
      const saveTo = join(baseDir, `redprotocol-upload`)
      const filePath = join(
        saveTo,
        `${randomFillSync(Buffer.alloc(16)).toString('hex')}-${info.filename}`,
      )

      f = mkdir(saveTo, { recursive: true }).then(
        () =>
          new Promise((resolve2, reject2) =>
            file
              .pipe(createWriteStream(filePath))
              .on('finish', () =>
                resolve2({
                  filePath,
                  fileInfo: info,
                }),
              )
              .on('error', reject2),
          ),
      )
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    bb.on('close', async () => {
      if (!f) {
        res.writeHead(400)
        res.end('400 bad request')
        return
      }

      try {
        const { filePath, fileInfo } = await f

        let fileType: {
          mime: string
        } = await getFileType(filePath)

        if (!fileType?.mime)
          fileType = {
            mime: 'application/octet-stream',
          }

        // TODO: fileInfo 里也有个 mimeType，也拿出来那个看看呗

        const category = fileType.mime.split('/')[0]

        const [md5, imageInfo, fileSize] = await Promise.all([
          getFileMd5(filePath),
          category === 'image' ? getImageSizeFromPath(filePath) : undefined,
          getFileSize(filePath),
        ])

        const richMediaPath =
          qqVersion > 17000
            ? await getRichMediaFilePathForGuild({
                path_info: {
                  md5HexStr: md5,
                  fileName: fileInfo.filename,
                  elementType: 2, // TODO: 根据 mime 决定，使文件能放入对应文件夹
                  elementSubType: 0,
                  thumbSize: 0,
                  needCreate: true,
                  fileType: 1,
                  file_uuid: '',
                  downloadType: 1,
                },
              })
            : await getRichMediaFilePath({
                md5HexStr: md5,
                fileName: fileInfo.filename,
                elementType: 2, // TODO: 根据 mime 决定，使文件能放入对应文件夹
                elementSubType: 0,
                thumbSize: 0,
                needCreate: true,
                fileType: 1,
              })

        await copyFile(filePath, richMediaPath)

        resolve({
          md5,
          imageInfo,
          fileSize,
          filePath,
          ntFilePath: richMediaPath,
        })
      } catch (e) {
        console.log(e)
        res.writeHead(500)
        res.end('500 internal server error')
      }
    })

    req.pipe(bb)
  })
}

async function messageCreateUsingJson({ config, res, json }: RouteContext) {
  const { channel_id, content } = (await json()) as MessageCreatePayload

  if (
    !channel_id ||
    !content ||
    (content && Array.isArray(content) && !content.length)
  ) {
    res.writeHead(400)
    res.end('400 bad request')
    return
  }

  return new Messager(
    (await getAuthData()).uin,
    config,
    common,
    channel_id,
  ).send(content)
}
