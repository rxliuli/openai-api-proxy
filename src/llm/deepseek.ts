import OpenAI from 'openai'
import { IChat } from './base'
import { openaiBase } from './openai'

export function deepseek(env: Record<string, string>): IChat {
  const r = openaiBase({
    createClient: () =>
      new OpenAI({
        apiKey: env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      }),
  })
  r.name = 'deepseek'
  r.requiredEnv = ['DEEPSEEK_API_KEY']
  r.supportModels = ['deepseek-reasoner', 'deepseek-chat', 'deepseek-coder']
  return r
}
