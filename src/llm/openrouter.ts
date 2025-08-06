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
  r.supportModels = env.OPENROUTER_MODELS?.split(',').map((it) => it.trim()) ?? [
    'anthropic/claude-opus-4.1',
    'anthropic/claude-opus-4',
    'anthropic/claude-sonnet-4',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
  ]
  r.requiredEnv = ['OPENROUTER_API_KEY']
  return r
}
