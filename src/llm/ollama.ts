import OpenAI from 'openai'
import { IChat } from './base'
import { openaiBase } from './openai'

export function ollama(env: Record<string, string>): IChat {
  const client = new OpenAI({
    apiKey: 'openai-api-proxy',
    baseURL: env.OLLAMA_BASE_URL,
  })
  const r = openaiBase({
    createClient: () => client,
    pre: (req) => ({
      ...req,
      model: req.model.split('/')[1],
      stream: false,
    }),
  })
  r.name = 'ollama'
  r.requiredEnv = ['OLLAMA_BASE_URL']
  r.supportModels = (env.OLLAMA_MODELS ?? '').split(',').map((it) => {
    return `ollama/${it}`
  })
  return r
}
