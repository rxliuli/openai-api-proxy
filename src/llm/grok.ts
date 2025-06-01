import { IChat } from './base'
import OpenAI from 'openai'
import { openaiBase } from './openai'

export function grok(env: Record<string, string>): IChat {
  const r = openaiBase({
    createClient: () =>
      new OpenAI({
        apiKey: env.GROK_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      }),
  })
  r.name = 'grok'
  r.requiredEnv = ['GROK_API_KEY']
  r.supportModels = ['grok-3-latest', 'grok-3-fast-latest', 'grok-3-mini-latest', 'grok-3-mini-fast-latest']
  return r
}
