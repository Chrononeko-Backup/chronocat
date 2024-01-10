import type { ValidateFunction } from 'ajv'
import localize from 'ajv-i18n/localize/zh'
import type { ChronocatConfig } from './types'
import { validate } from './validate'

export const parseConfig = (config: unknown, uin: string) => {
  if (!(validate as ValidateFunction<ChronocatConfig>)(config)) {
    localize((validate as ValidateFunction<ChronocatConfig>).errors)

    let e = 'Chronocat 加载配置失败，请检查 chronocat.yml。详细信息：\n'
    let i = 0
    for (const error of (validate as ValidateFunction<ChronocatConfig>).errors!)
      e += `问题 ${++i}：${error.schemaPath}：${error.message}`

    throw e
  }

  const result = Object.assign({}, config, config.overrides?.[uin])
  if ('overrides' in result) delete result.overrides

  return result
}
