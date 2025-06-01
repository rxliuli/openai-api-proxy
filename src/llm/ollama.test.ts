import { expect, it } from 'vitest'
import { ollama } from './ollama'

it('ollama', async () => {
  const client = ollama({
    OLLAMA_BASE_URL: import.meta.env.VITE_OLLAMA_BASE_URL,
  })
  const res = await client.invoke({
    messages: [{ role: 'user', content: 'Hello?' }],
    model: 'ollama/qwen2.5:0.5b',
    temperature: 0.5,
    presence_penalty: 0,
    frequency_penalty: 0,
    top_p: 1,
  })
  expect(res.choices[0].message.content).not.undefined
})

it('stream', async () => {
  const client = ollama({
    OLLAMA_BASE_URL: import.meta.env.VITE_OLLAMA_BASE_URL,
  })
  const res = client.stream(
    {
      messages: [{ role: 'user', content: 'Hello?' }],
      model: 'ollama/qwen2.5:0.5b',
      temperature: 0.5,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 1,
      stream: true,
    },
    new AbortController().signal,
  )
  const chunks: string[] = []
  for await (const chunk of res) {
    chunks.push(chunk.choices[0].delta?.content ?? '')
  }
  expect(chunks.join('')).not.undefined
})
