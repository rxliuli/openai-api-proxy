import OpenAI, { AzureOpenAI, ClientOptions } from 'openai'
import { IChat } from './base'
import { ChatCompletionCreateParams } from 'openai/resources/index.mjs'

export function openaiBase(options: {
  createClient: (req: ChatCompletionCreateParams) => OpenAI | AzureOpenAI
  pre?: (req: ChatCompletionCreateParams) => ChatCompletionCreateParams
}): IChat {
  const pre = options.pre ?? ((req) => req)
  return {
    name: 'openai',
    supportModels: [
      'chatgpt-4o-latest',
      'codex-mini-latest',
      'computer-use-preview',
      'computer-use-preview-2025-03-11',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-0125',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-instruct',
      'gpt-3.5-turbo-instruct-0914',
      'gpt-4',
      'gpt-4-0125-preview',
      'gpt-4-0613',
      'gpt-4-1106-preview',
      'gpt-4-turbo',
      'gpt-4-turbo-2024-04-09',
      'gpt-4-turbo-preview',
      'gpt-4.1',
      'gpt-4.1-2025-04-14',
      'gpt-4.1-mini',
      'gpt-4.1-mini-2025-04-14',
      'gpt-4.1-nano',
      'gpt-4.1-nano-2025-04-14',
      'gpt-4.5-preview',
      'gpt-4.5-preview-2025-02-27',
      'gpt-4o',
      'gpt-4o-2024-05-13',
      'gpt-4o-2024-08-06',
      'gpt-4o-2024-11-20',
      'gpt-4o-audio-preview',
      'gpt-4o-audio-preview-2024-10-01',
      'gpt-4o-audio-preview-2024-12-17',
      'gpt-4o-mini',
      'gpt-4o-mini-2024-07-18',
      'gpt-4o-mini-audio-preview',
      'gpt-4o-mini-audio-preview-2024-12-17',
      'gpt-4o-mini-realtime-preview',
      'gpt-4o-mini-realtime-preview-2024-12-17',
      'gpt-4o-mini-search-preview',
      'gpt-4o-mini-search-preview-2025-03-11',
      'gpt-4o-mini-transcribe',
      'gpt-4o-mini-tts',
      'gpt-4o-realtime-preview',
      'gpt-4o-realtime-preview-2024-10-01',
      'gpt-4o-realtime-preview-2024-12-17',
      'gpt-4o-search-preview',
      'gpt-4o-search-preview-2025-03-11',
      'gpt-4o-transcribe',
      'gpt-image-1',
      'o1',
      'o1-2024-12-17',
      'o1-mini',
      'o1-mini-2024-09-12',
      'o1-preview',
      'o1-preview-2024-09-12',
      'o1-pro',
      'o1-pro-2025-03-19',
      'o3',
      'o3-2025-04-16',
      'o3-mini',
      'o3-mini-2025-01-31',
      'o4-mini',
      'o4-mini-2025-04-16',
      'omni-moderation-2024-09-26',
      'omni-moderation-latest',
    ],
    requiredEnv: ['OPENAI_API_KEY'],
    invoke(req) {
      const _req = pre(req)
      const client = options.createClient(_req)
      return client.chat.completions.create({
        ..._req,
        stream: false,
      })
    },
    async *stream(req, signal) {
      const _req = pre(req)
      const client = options.createClient(_req)
      const stream = await client.chat.completions.create({
        ..._req,
        stream: true,
      })
      for await (const it of stream) {
        yield it
      }
    },
  }
}

export function openai(env: Record<string, string>): IChat {
  return openaiBase({
    createClient: () =>
      new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      }),
  })
}
