import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Message, WsPackage } from '../../src/red'

export const satoriConfig = {
  type: 'satori',
  listen: '0.0.0.0',
  platform: 'chronocat',
  port: 5500,
  self_url: 'https://chronocat.vercel.app',
  token: 'DEFINE_CHRONO_TOKEN',
  enable: true,
} as const

export const saveResult = {
  filePath: '',
  fileSize: 0,
  fileName: '',
  fileMime: '',
  md5: '',
  imageInfo: {
    width: 0,
    height: 0,
    type: 'png',
    mime: 'image/png',
    wUnits: '1',
    hUnits: '1',
  },
}

export const commonSave = jest.fn(async () => saveResult)

export const getMockMessage = async () =>
  (
    JSON.parse(
      (
        await readFile(
          resolve(__dirname, '../parser/fixtures/f-2-1-0-0/data.json'),
        )
      ).toString('utf-8'),
    ) as WsPackage<Message[]>
  ).payload[0]
