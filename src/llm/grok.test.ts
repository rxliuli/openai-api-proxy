import { beforeEach, expect, it } from 'vitest'
import { bailian } from '../bailian'
import OpenAI from 'openai'
import { IChat } from '../base'
import { last } from 'lodash-es'
import { grok } from '../grok'

let client: IChat
beforeEach(() => {
  client = grok({
    GROK_API_KEY: import.meta.env.VITE_GROK_API_KEY,
  })
})
it('invoke', async () => {
  const res = await client.invoke({
    model: 'grok-3-latest',
    messages: [{ role: 'user', content: '你是？' }],
    temperature: 0,
  })
  expect(res.choices[0].message.content).not.undefined
})
it('stream usage', async () => {
  const res = client.stream(
    {
      model: 'grok-3-mini-latest',
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
  expect(content).not.undefined
  // grok不会返回usage信息
})
