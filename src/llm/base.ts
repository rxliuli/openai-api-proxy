import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletion,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionChunk,
} from 'openai/resources/index.mjs'

export interface IChat {
  name: string
  supportModels: string[]
  requiredEnv: string[]
  invoke(req: ChatCompletionCreateParamsNonStreaming): Promise<ChatCompletion>
  stream(req: ChatCompletionCreateParamsStreaming, signal: AbortSignal): AsyncGenerator<ChatCompletionChunk>
}

export interface ChatEnv {
  [key: string]: string | undefined
}
