// eslint-disable-next-line import/no-unresolved
import { app } from 'electron'

let modes: string[] | undefined = undefined

const splitModes = (modes: string) => modes.split(',').filter(Boolean)

const loadModes = () => {
  const result = splitModes(
    app.commandLine.getSwitchValue('chrono-mode'),
  ).concat(splitModes(process.env['CHRONO_MODE'] || ''))

  if (result.includes('headless3')) result.push('login')
  if (result.includes('headless4')) result.push('login')

  return [...new Set(result)]
}

export const getChronocatModes = () => {
  if (!modes) modes = loadModes()
  return modes
}

export const isChronocatMode = (mode: string) =>
  getChronocatModes().includes(mode)
