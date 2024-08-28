import OpenAI from 'openai'
import { openaiBase } from './openai'

export function lingyiwanwu(env: Record<string, string>) {
  const r = openaiBase({
    createClient: () =>
      new OpenAI({
        apiKey: env.LINGYIWANWU_API_KEY,
        baseURL: 'https://api.lingyiwanwu.com/v1',
      }),
  })
  r.name = 'lingyiwanwu'
  r.requiredEnv = ['LINGYIWANWU_API_KEY']
  r.supportModels = [
    'yi-large',
    'yi-medium',
    'yi-vision',
    'yi-medium-200k',
    'yi-spark',
    'yi-large-rag',
    'yi-large-fc',
    'yi-large-turbo',
    'yi-large-preview',
  ]
  return r
}
