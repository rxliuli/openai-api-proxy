import OpenAI from 'openai'
import { openaiBase } from './openai'

export function cerebras(env: Record<string, string>) {
  const map = {
    'cerebras/llama-3.1-70b': 'llama-3-70b',
    'cerebras/llama-3.1-8b': 'llama-3-8b',
  }
  const r = openaiBase({
    createClient: () =>
      new OpenAI({
        apiKey: env.CEREBRAS_API_KEY,
        baseURL: 'https://api.cerebras.ai/v1',
      }),
    pre(req) {
      req.model = map[req.model as keyof typeof map]
      return req
    },
  })
  r.name = 'cerebras'
  r.requiredEnv = ['CEREBRAS_API_KEY']
  r.supportModels = Object.keys(map)
  return r
}
