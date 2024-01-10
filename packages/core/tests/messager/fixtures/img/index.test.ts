import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Messager } from '../../../../src/satori/messager'
import { getMockMessage, satoriConfig, saveResult } from '../../../mocks'

test('Satori编码器应当正确编码 图片消息', async () => {
  const send = jest.fn().mockReturnValueOnce(getMockMessage())
  const save = jest.fn().mockReturnValueOnce(saveResult)

  const sendResult = await new Messager(
    '9999',
    satoriConfig,
    {
      send,
      save,
    },
    '9998',
  ).send(
    `xxx<img src="${pathToFileURL(
      resolve(__dirname, '../../../../docs/static/chronocat.png'),
    ).toString()}" />yyy`,
  )

  expect(send.mock.calls).toMatchSnapshot()

  expect(save.mock.calls).toHaveLength(1)
  expect(save.mock.calls[0]).toHaveLength(1)
  expect((save.mock.calls[0] as [string])[0]).toMatch(
    /\/docs\/static\/chronocat.png$/,
  )

  expect(sendResult).toHaveLength(1)
  expect(sendResult[0].id).toBe('1000000000000000000')
})
