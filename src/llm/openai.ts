import OpenAI, { ClientOptions } from 'openai'
import { IChat } from './base'
import { ChatCompletionCreateParams } from 'openai/resources/index.mjs'

export function openaiBase(
  options?: ClientOptions & {
    pre?: (req: ChatCompletionCreateParams) => ChatCompletionCreateParams
  },
): IChat {
  return {
    name: 'openai',
    supportModels: [
      'text-embedding-3-large',
      'text-embedding-3-small',
      'gpt-4-0125-preview',
      'text-embedding-ada-002',
      'gpt-4o',
      'dall-e-2',
      'tts-1',
      'tts-1-hd-1106',
      'tts-1-1106',
      'tts-1-hd',
      'dall-e-3',
      'babbage-002',
      'gpt-4-turbo-preview',
      'gpt-4o-2024-08-06',
      'gpt-4o-2024-05-13',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-1106',
      'whisper-1',
      'gpt-3.5-turbo-16k',
      'chatgpt-4o-latest',
      'gpt-3.5-turbo-instruct-0914',
      'gpt-3.5-turbo-0125',
      'gpt-4-0613',
      'gpt-3.5-turbo-instruct',
      'gpt-4-1106-preview',
      'gpt-4-turbo-2024-04-09',
      'gpt-4o-mini',
      'davinci-002',
      'gpt-4-turbo',
      'gpt-4o-mini-2024-07-18',
    ],
    requiredEnv: ['OPENAI_API_KEY'],
    invoke(req) {
      const client = new OpenAI(options)
      return client.chat.completions.create(
        options?.pre
          ? (options.pre({
              ...req,
              stream: false,
            }) as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming)
          : { ...req, stream: false },
      )
    },
    async *stream(req, signal) {
      const client = new OpenAI(options)
      const stream = await client.chat.completions.create(
        options?.pre
          ? (options.pre({
              ...req,
              stream: true,
            }) as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming)
          : { ...req, stream: true },
        { signal },
      )
      for await (const it of stream) {
        yield it
      }
    },
  }
}

export function openai(env: Record<string, string>): IChat {
  return openaiBase({
    apiKey: env.OPENAI_API_KEY,
  })
}
