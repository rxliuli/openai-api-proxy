import OpenAI from 'openai'
import { expect, it } from 'vitest'
import { deepseek } from './deepseek'
import { omit } from 'lodash-es'

it('deepseek', async () => {
  const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  })
  const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: 'Hello, world!' }],
    temperature: 0,
  }
  const r1 = await client.chat.completions.create(params)
  const r2 = await deepseek({
    DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY,
  }).invoke(params)
  expect(omit(r1, ['id', 'created'])).toEqual(omit(r2, ['id', 'created']))
})
