import { IChat } from './base'
import { openaiBase } from './openai'

export function groq(env: Record<string, string>): IChat {
  const r = openaiBase(env, {
    apiKey: env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  })
  r.name = 'groq'
  r.requiredEnv = ['GROQ_API_KEY']
  r.supportModels = [
    'distil-whisper-large-v3-en',
    'gemma2-9b-it',
    'gemma-7b-it',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'llama3-groq-70b-8192-tool-use-preview',
    'llama3-groq-8b-8192-tool-use-preview',
    'llama-guard-3-8b',
    'mixtral-8x7b-32768',
    'whisper-large-v3',
  ]
  return r
}
