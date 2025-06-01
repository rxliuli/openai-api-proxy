import { expect, it } from 'vitest'
import { groq } from './groq'

it('groq', async () => {
  const client = groq({
    GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
  })
  const res = await client.invoke({
    messages: [{ role: 'user', content: 'Hello?' }],
    model: 'groq/llama3-8b-8192',
    temperature: 0.5,
    presence_penalty: 0,
    frequency_penalty: 0,
    top_p: 1,
  })
  expect(res.choices[0].message.content).not.undefined
})

it('stream', async () => {
  const client = groq({
    GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
  })
  const res = client.stream(
    {
      messages: [{ role: 'user', content: 'Hello?' }],
      model: 'groq/llama3-8b-8192',
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
