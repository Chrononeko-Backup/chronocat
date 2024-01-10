import { Messager } from '../../../../src/satori/messager'
import { commonSave, getMockMessage, satoriConfig } from '../../../mocks'

test('Satori编码器应当正确编码 纯文本消息', async () => {
  const send = jest.fn().mockReturnValueOnce(getMockMessage())

  const sendResult = await new Messager(
    '9999',
    satoriConfig,
    {
      send,
      save: commonSave,
    },
    '9998',
  ).send('xxx')

  expect(send.mock.calls).toMatchSnapshot()

  expect(sendResult).toHaveLength(1)
  expect(sendResult[0].id).toBe('1000000000000000000')
})
