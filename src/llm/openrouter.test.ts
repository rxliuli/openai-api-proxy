import { beforeEach, expect, it } from 'vitest'
import OpenAI from 'openai'
import { last } from 'lodash-es'
import { IChat } from './base'
import { openrouter } from './openrouter'

let client: IChat
beforeEach(() => {
  client = openrouter(import.meta.env)
})
it('invoke', async () => {
  const res = await client.invoke({
    model: 'openai/gpt-4o-mini',
    messages: [{ role: 'user', content: 'hello' }],
    temperature: 0,
  })
  expect(res.choices[0].message.content).not.undefined
})
it('stream usage', async () => {
  const res = client.stream(
    {
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'hello' }],
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
