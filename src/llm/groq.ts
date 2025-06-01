import OpenAI from 'openai'
import { IChat } from './base'
import { openaiBase } from './openai'

export function groq(env: Record<string, string>): IChat {
  const map = {
    'groq/distil-whisper-large-v3-en': 'distil-whisper-large-v3-en',
    'groq/gemma2-9b-it': 'gemma2-9b-it',
    'groq/gemma-7b-it': 'gemma-7b-it',
    'groq/llama-3.1-70b-versatile': 'llama-3.1-70b-versatile',
    'groq/llama-3.1-8b-instant': 'llama-3.1-8b-instant',
    'groq/llama3-70b-8192': 'llama3-70b-8192',
    'groq/llama3-8b-8192': 'llama3-8b-8192',
    'groq/llama3-groq-70b-8192-tool-use-preview': 'llama3-groq-70b-8192-tool-use-preview',
    'groq/llama3-groq-8b-8192-tool-use-preview': 'llama3-groq-8b-8192-tool-use-preview',
    'groq/llama-guard-3-8b': 'llama-guard-3-8b',
    'groq/mixtral-8x7b-32768': 'mixtral-8x7b-32768',
    'groq/whisper-large-v3': 'whisper-large-v3',
  }
  const r = openaiBase({
    createClient: () =>
      new OpenAI({
        apiKey: env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
    pre(req) {
      req.model = map[req.model as keyof typeof map]
      return req
    },
  })
  r.name = 'groq'
  r.requiredEnv = ['GROQ_API_KEY']
  r.supportModels = Object.keys(map)
  return r
}
