import { beforeEach, it, expect } from 'vitest'
import { IChat } from './base'
import { cohere } from './cohere'
import OpenAI from 'openai'
import { last } from 'lodash-es'

let client: IChat
beforeEach(() => {
  client = cohere({
    COHERE_API_KEY: import.meta.env.VITE_COHERE_API_KEY,
  })
})
it('invoke', async () => {
  const res = await client.invoke({
    model: 'command-r-plus',
    messages: [{ role: 'user', content: '你是？' }],
    temperature: 0,
  })
  console.log('converted: ', res)
  expect(res.choices[0].message.content).not.undefined
})

it('stream', async () => {
  const stream = client.stream(
    {
      model: 'command-r-plus',
      messages: [{ role: 'user', content: '你是？' }],
      temperature: 0,
      stream: true,
    },
    new AbortController().signal,
  )
  const chunks: OpenAI.ChatCompletionChunk[] = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  expect(chunks).not.empty
  const content = chunks.map((it) => it.choices[0]?.delta.content).join('')
  expect(content).not.empty
  expect(last(chunks)!.usage).not.undefined
})
