import { commonSave } from './save'
import { commonSend } from './send'

export const common = {
  send: commonSend,
  save: commonSave,
} as const

export type Common = typeof common
