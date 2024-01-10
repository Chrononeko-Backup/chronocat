import { load } from 'js-yaml'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseConfig } from '../../../../src/config/parser'

test('配置文件解析器应当正确解析 被覆写的默认值', async () => {
  expect.assertions(2)

  const raw = (await readFile(join(__dirname, 'chronocat.yml'))).toString()
  const config = load(raw)

  const parsed1 = parseConfig(config, '1')
  expect(parsed1).toMatchSnapshot()

  const parsed10000 = parseConfig(config, '10000')
  // 虽然 enable 的默认值为 true，但由于 10000 账号的配置并未覆写 enable，所以解析得到的 enable 仍应为 false
  expect(parsed10000).toMatchSnapshot()
})
