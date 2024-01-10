import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Message, WsPackage } from '../../../../src/red'
import { buildParser } from '../../../../src/satori/parser'
import { satoriConfig } from '../../../mocks'

test('Satori解析器应当正确解析 纯文本消息', async () => {
  const data = JSON.parse(
    (await readFile(join(__dirname, 'data.json'))).toString('utf-8'),
  ) as WsPackage<Message[]>

  expect(data.payload).toHaveLength(1)

  const [message] = data.payload
  const events = await buildParser('9999', satoriConfig)(message)

  expect(events).toBeTruthy() // 解析到的消息应该存在
  expect(events).toHaveLength(1) // 应当解析到 1 条消息
})
