import { load } from 'js-yaml'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseConfig } from '../../../../src/config/parser'

test('配置文件解析器应当正确解析 空文件', async () => {
  expect.assertions(1)

  const raw = (await readFile(join(__dirname, 'chronocat.yml'))).toString()
  const config = load(raw)

  try {
    parseConfig(config, '1')
  } catch (e) {
    expect(e).toBe(
      'Chronocat 加载配置失败，请检查 chronocat.yml。详细信息：\n问题 1：#/type：应当是 object 类型',
    )
  }
})
