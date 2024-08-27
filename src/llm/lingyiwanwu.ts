import { openaiBase } from './openai'

export function lingyiwanwu(env: Record<string, string>) {
  const r = openaiBase({
    baseURL: 'https://api.lingyiwanwu.com/v1',
    apiKey: env.LINGYIWANWU_API_KEY,
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
