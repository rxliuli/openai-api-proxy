import OpenAI from 'openai'
import { openaiBase } from './openai'

export function cerebras(env: Record<string, string>) {
  const r = openaiBase({
    createClient: () =>
      new OpenAI({
        apiKey: env.CEREBRAS_API_KEY,
        baseURL: 'https://api.cerebras.ai/v1',
      }),
  })
  r.name = 'cerebras'
  r.requiredEnv = ['CEREBRAS_API_KEY', 'CEREBRAS_MODELS']
  r.supportModels = env.CEREBRAS_MODELS?.split(',').map((it) => it.trim()) ?? []
  return r
}
