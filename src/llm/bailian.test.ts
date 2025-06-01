import { beforeEach, expect, it } from 'vitest'
import { bailian } from './bailian'
import OpenAI from 'openai'
import { IChat } from './base'
import { last } from 'lodash-es'

let client: IChat
beforeEach(() => {
  client = bailian({
    ALIYUN_BAILIAN_API_KEY: import.meta.env.VITE_ALIYUN_BAILIAN_API_KEY,
  })
})
it('invoke', async () => {
  const res = await client.invoke({
    model: 'qwen-max',
    messages: [{ role: 'user', content: '你是？' }],
    temperature: 0,
  })
  expect(res.choices[0].message.content).not.undefined
})
it('stream usage', async () => {
  const res = client.stream(
    {
      model: 'qwen-max',
      messages: [{ role: 'user', content: '你是？' }],
      temperature: 0,
      stream: true,
    },
    new AbortController().signal,
  )
  const r: OpenAI.Chat.Completions.ChatCompletionChunk[] = []
  for await (const chunk of res) {
    r.push(chunk)
  }
  const content = r.map((it) => it.choices[0]?.delta.content).join('')
  expect(last(r)!.usage).not.undefined
  expect(content).not.undefined
})
