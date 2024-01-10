import { homedir } from 'node:os'
import { join } from 'node:path'

export const legacyBaseDir = join(
  process.env['APPDATA'] || homedir(),
  'BetterUniverse/QQNT',
)

export const baseDir = join(homedir(), '.chronocat')
