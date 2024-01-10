// https://github.com/import-js/eslint-plugin-import/issues/2802
// eslint-disable-next-line import/no-unresolved
import { app } from 'electron'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import defaultConfig from '../../../docs/static/chronocat.yml'
import { baseDir, legacyBaseDir } from '../utils/baseDir'
import { generateToken } from '../utils/token'

export const ensureConfig = async () => {
  const configDir = join(baseDir, 'config')
  const configPath = join(configDir, 'chronocat.yml')
  const legacyTokenPath = join(legacyBaseDir, 'RED_PROTOCOL_TOKEN')

  if (!(await exists(configPath))) {
    // 配置文件不存在，生成新配置
    let newToken =
      app.commandLine.getSwitchValue('chrono-default-token') ||
      process.env['CHRONO_DEFAULT_TOKEN'] ||
      generateToken()

    // 检查旧 token 文件
    if (await exists(legacyTokenPath))
      // 旧 token 文件存在，保持 token 不变
      newToken = (await readFile(legacyTokenPath, 'utf-8')).trim()
    else {
      // 旧 token 文件不存在
      // 为兼容性考虑，将生成的 token 写入旧 token 文件
      // TODO: 0.0.46 版本稳定后删除整个 else 块
      await mkdir(legacyBaseDir, {
        recursive: true,
      })
      await writeFile(legacyTokenPath, newToken)
    }

    const newConfig = defaultConfig.replaceAll(
      'DEFINE_CHRONO_TOKEN',
      `'${newToken}'`,
    )
    await mkdir(configDir, {
      recursive: true,
    })
    await writeFile(configPath, newConfig)
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
  } catch (_) {
    return false
  }
  return true
}
