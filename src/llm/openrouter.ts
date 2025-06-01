import OpenAI from 'openai'
import { IChat } from './base'
import { openaiBase } from './openai'

export function openrouter(env: Record<string, string>): IChat {
  const r = openaiBase({
    createClient: () => {
      return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: env.OPENROUTER_API_KEY,
      })
    },
  })
  r.name = 'OpenRouter'
  r.supportModels = env.OPENROUTER_MODELS?.split(',').map((it) => it.trim()) ?? ['qwen-max']
  r.requiredEnv = ['OPENROUTER_API_KEY']
  return r
}
