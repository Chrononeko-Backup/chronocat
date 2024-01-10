import { load } from 'js-yaml'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseConfig } from '../../../../src/config/parser'

test('配置文件解析器应当正确解析 默认配置文件', async () => {
  expect.assertions(2)

  const raw = (await readFile(join(__dirname, 'chronocat.yml'))).toString()
  const config = load(raw)

  // parseConfig 一参是传入的 chronocat.yml，二参是当前登录的 QQ 号
  const parsed1 = parseConfig(config, '1')
  // 当前登录的 QQ 是 1，1 这个 QQ 在 overrides 里没有找见，于是使用默认设置
  expect(parsed1).toMatchSnapshot()

  // 当前登录的 QQ 是 10000
  // 10000 这个 QQ 在 overrides 里有
  // 那么，overrides 定义的每一个属性都会直接覆盖掉根对象的属性
  // chronocat.yml 里，10000 下面覆写了 servers 这个属性
  // 因此根对象的 servers 设置就被抛弃了，直接使用覆写后的 servers，所以端口是 16531 和 5501
  const parsed10000 = parseConfig(config, '10000')
  expect(parsed10000).toMatchSnapshot()
})
