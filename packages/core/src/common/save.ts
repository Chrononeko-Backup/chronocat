import mime from 'mime/lite'
import fetch from 'node-fetch'
import { createReadStream, createWriteStream } from 'node:fs'
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { finished } from 'node:stream/promises'
import {
  getFileMd5,
  getFileSize,
  getFileType,
  getImageSizeFromPath,
} from '../ipc/definitions/fsApi'
import {
  getRichMediaFilePath,
  getRichMediaFilePathForGuild,
} from '../ipc/definitions/msgService'
import { baseDir } from '../utils/baseDir'
import { qqVersion } from '../utils/qqVersion'
import { generateToken16 } from '../utils/token'
import type { CommonSaveResult } from './types'

const dispositionRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/

export const commonSave = async (
  urlString: string,
): Promise<CommonSaveResult> => {
  const url = new URL(urlString)

  let fileName: string
  let filePath: string
  let fileMime: string | undefined = undefined

  switch (url.protocol) {
    case 'file:': {
      // 本地图片
      fileName = basename(url.pathname)
      filePath = await saveFile(createReadStream(url), fileName)
      break
    }

    case 'http:':
    case 'https:': {
      const response = await fetch(url)

      // TODO: response.headers.get('Content-Type')

      // 从 URL 获得文件名
      fileName = basename(url.pathname)

      // 从 Content-Disposition 获得文件名
      const disposition = response.headers.get('Content-Disposition')
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const matches = dispositionRegex.exec(disposition)
        if (matches && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '')
        }
      }

      // 从 Content-Type 获得 MIME
      fileMime = response.headers.get('Content-Type') || undefined
      if (fileMime && !fileName.includes('.')) {
        const ext = mime.getExtension(fileMime)
        fileName += ext ? '.' + ext : ''
      }

      filePath = await saveFile(
        // Readable.fromWeb(response.body as ReadableStream),
        response.body!,
        fileName,
      )

      break
    }

    case 'data:': {
      const capture = /^data:([\w/-]+);base64,(.*)$/.exec(urlString)
      if (capture) {
        fileMime = capture[1]
        const base64 = capture[2]
        const ext = mime.getExtension(fileMime)
        fileName = generateToken16() + (ext ? '.' + ext : '')
        filePath = await saveBuffer(Buffer.from(base64, 'base64'), fileName)
      } else throw new Error('unsupportted data uri')

      break
    }

    default: {
      throw new Error(`unsupportted protocol: ${url.protocol}`)
    }
  }

  if (!fileMime) {
    // MIME 未知，使用 QQ 能力检测 MIME
    const fileType: {
      mime: string
    } = await getFileType(filePath)
    if (fileType?.mime) fileMime = fileType.mime
  }

  if (!fileMime) {
    // QQ 也不能检测，使用默认 MIME
    fileMime = 'application/octet-stream'
  }

  const fileCategory = fileMime.split('/')[0]

  const [md5, imageInfo, fileSize] = await Promise.all([
    getFileMd5(filePath),
    fileCategory === 'image' ? getImageSizeFromPath(filePath) : undefined,
    getFileSize(filePath),
  ])

  const richMediaPath =
    qqVersion > 17000
      ? await getRichMediaFilePathForGuild({
          path_info: {
            md5HexStr: md5,
            fileName,
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
          fileName,
          elementType: 2, // TODO: 根据 mime 决定，使文件能放入对应文件夹
          elementSubType: 0,
          thumbSize: 0,
          needCreate: true,
          fileType: 1,
        })

  await copyFile(filePath, richMediaPath)

  void rm(filePath)

  return {
    filePath: richMediaPath,
    fileSize,
    fileName,
    fileMime,
    md5,
    imageInfo,
  }
}

async function saveFile(
  file: {
    pipe: <T extends NodeJS.WritableStream>(
      destination: T,
      options?: { end?: boolean | undefined },
    ) => T
  },
  fileName: string,
) {
  const filePath = await generateFilePath(fileName)
  await finished(file.pipe(createWriteStream(filePath)))
  return filePath
}

async function saveBuffer(buffer: Buffer, fileName: string) {
  const filePath = await generateFilePath(fileName)
  await writeFile(filePath, buffer)
  return filePath
}

async function generateFilePath(fileName: string) {
  const dir = join(baseDir, 'tmp/upload')
  await mkdir(dir, {
    recursive: true,
  })
  return join(dir, `${generateToken16()}-${fileName}`)
}
