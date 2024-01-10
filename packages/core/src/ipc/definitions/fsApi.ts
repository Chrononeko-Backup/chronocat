import type { PathLike } from 'node:fs'
import { defineIpcApi } from '../define'

export const getFileMd5 = defineIpcApi<string, [PathLike]>(
  'IPC_UP_2',
  'ns-fsApi-2',
  'getFileMd5',
)

export const getImageSizeFromPath = defineIpcApi<
  {
    width: number
    height: number
    type: string // png
    mime: string // image/png
    wUnits: string // px
    hUnits: string // px
  },
  [PathLike]
>('IPC_UP_2', 'ns-fsApi-2', 'getImageSizeFromPath')

export const getFileSize = defineIpcApi<number, [PathLike]>(
  'IPC_UP_2',
  'ns-fsApi-2',
  'getFileSize',
)

export const getFileType = defineIpcApi<
  {
    mime: string
  },
  [PathLike]
>('IPC_UP_2', 'ns-fsApi-2', 'getFileType')
