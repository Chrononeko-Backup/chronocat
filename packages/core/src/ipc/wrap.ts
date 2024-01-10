// https://github.com/import-js/eslint-plugin-import/issues/2802
// eslint-disable-next-line import/no-unresolved
import { ipcMain } from 'electron'
import type { IpcEmit, IpcP2 } from './types'

export const wrapIpc = <D = IpcP2>(fn: (emit: IpcEmit<D>) => IpcEmit<D>) => {
  const emit = ipcMain.emit.bind(ipcMain)
  ipcMain.emit = fn(emit)
  return () => {
    ipcMain.emit = emit
  }
}
