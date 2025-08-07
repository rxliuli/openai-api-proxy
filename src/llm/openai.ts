import OpenAI, { AzureOpenAI } from 'openai'
import { IChat } from './base'
import { ChatCompletionCreateParams } from 'openai/resources/index.mjs'
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources.js'
import {
  ResponseInputFile,
  ResponseInputImage,
  ResponseInputText,
  ResponseOutputMessage,
  ResponseOutputText,
} from 'openai/resources/responses/responses.mjs'
import { Response } from 'openai/resources/responses/responses.js'
import { HTTPException } from 'hono/http-exception'

export function openaiBase(options: {
  createClient: (req: ChatCompletionCreateParams) => OpenAI | AzureOpenAI
  pre?: (req: ChatCompletionCreateParams) => ChatCompletionCreateParams
}): IChat {
  const pre = options.pre ?? ((req) => req)
  return {
    name: 'openai',
    supportModels: [],
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
        if (signal?.aborted) {
          throw new Error('Aborted')
        }
        yield it
      }
    },
  }
}

function openaiResponse(options: { createClient: (req: ChatCompletionCreateParams) => OpenAI | AzureOpenAI }): IChat {
  function pre(
    req: OpenAI.Chat.Completions.ChatCompletionCreateParams,
  ): OpenAI.Responses.ResponseCreateParamsNonStreaming {
    return {
      input: req.messages.map((it) => ({
        role: it.role as any,
        content:
          typeof it.content === 'string'
            ? it.content
            : it.content!.map((c) => {
                if (c.type === 'text') {
                  return {
                    type: 'input_text',
                    text: c.text,
                  } satisfies ResponseInputText
                }
                if (c.type === 'image_url') {
                  return {
                    type: 'input_image',
                    image_url: c.image_url.url,
                    detail: c.image_url.detail ?? 'auto',
                  } satisfies ResponseInputImage
                }
                if (c.type === 'file') {
                  return {
                    type: 'input_file',
                    file_id: c.file.file_id,
                    filename: c.file.filename,
                    file_data: c.file.file_data,
                  } satisfies ResponseInputFile
                }
                throw new Error('Unsupported content type: ' + c.type)
              }),
      })),
      model: req.model,
      temperature: req.temperature,
      max_output_tokens: req.max_completion_tokens,
      top_p: req.top_p,
    } satisfies OpenAI.Responses.ResponseCreateParamsNonStreaming
  }
  return {
    name: 'openai',
    supportModels: [],
    requiredEnv: ['OPENAI_API_KEY'],
    async invoke(req) {
      const client = options.createClient(req)
      const resp = await client.responses.create(pre(req))
      return {
        id: resp.id,
        object: 'chat.completion',
        created: resp.created_at,
        model: resp.model,
        choices: [
          {
            index: 0,
            finish_reason: 'stop',
            message: {
              role: 'assistant',
              content: resp.output_text,
            },
            logprobs: null,
          } as ChatCompletion.Choice,
        ],
      } as ChatCompletion
    },
    async *stream(req, signal) {
      const client = options.createClient(req)
      const stream = await client.responses.create({
        ...pre(req),
        stream: true,
      })
      let response: Response
      for await (const it of stream) {
        if (signal?.aborted) {
          throw new Error('Aborted')
        }
        if (it.type === 'response.created') {
          response = it.response
          yield {
            id: it.response.id,
            choices: [
              {
                index: it.sequence_number,
                finish_reason: null,
                delta: {
                  role: 'assistant',
                  content: it.response.output_text ?? '',
                },
              },
            ],
            created: it.response.created_at,
            model: it.response.model,
            object: 'chat.completion.chunk',
          } satisfies ChatCompletionChunk
        } else if (it.type === 'response.output_text.delta') {
          yield {
            id: it.item_id,
            choices: [
              {
                index: it.sequence_number,
                delta: {
                  role: 'assistant',
                  content: it.delta,
                },
                logprobs: null,
                finish_reason: null,
              },
            ],
            created: response!.created_at,
            model: response!.model,
            object: 'chat.completion.chunk',
          } satisfies ChatCompletionChunk
        } else if (it.type === 'response.completed') {
          yield {
            id: it.response.id,
            choices: [
              {
                index: it.sequence_number,
                finish_reason: 'stop',
                delta: {
                  role: 'assistant',
                  content: it.response.output_text ?? '',
                },
              },
            ],
            usage: {
              prompt_tokens: it.response.usage!.input_tokens,
              completion_tokens: it.response.usage!.output_tokens,
              total_tokens: it.response.usage!.total_tokens,
            },
            created: it.response.created_at,
            model: it.response.model,
            object: 'chat.completion.chunk',
          } satisfies ChatCompletionChunk
        } else if (it.type === 'error') {
          throw new HTTPException(it.code as any, { message: it.message })
        }
      }
    },
  }
}

export function openai(env: Record<string, string>): IChat {
  const oldModels = [
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
    'o1-mini',
    'o1-mini-2024-09-12',

    'omni-moderation-2024-09-26',
    'omni-moderation-latest',
  ]
  const newModels = [
    'gpt-5-nano',
    'gpt-5',
    'gpt-5-mini-2025-08-07',
    'gpt-5-mini',
    'gpt-5-nano-2025-08-07',
    'o1-2024-12-17',
    'o1',
    'o3-mini',
    'o3-mini-2025-01-31',
    'o1-pro-2025-03-19',
    'o1-pro',
    'o3-2025-04-16',
    'o4-mini-2025-04-16',
    'o3',
    'o4-mini',
    'gpt-4.1-2025-04-14',
    'gpt-4.1',
    'gpt-4.1-mini-2025-04-14',
    'gpt-4.1-mini',
    'gpt-4.1-nano-2025-04-14',
    'gpt-4.1-nano',
    'o3-pro',
    'gpt-4o-realtime-preview-2025-06-03',
    'gpt-4o-audio-preview-2025-06-03',
    'o3-pro-2025-06-10',
    'o4-mini-deep-research',
    'o3-deep-research',
    'o3-deep-research-2025-06-26',
    'o4-mini-deep-research-2025-06-26',
    'gpt-5-chat-latest',
    'gpt-5-2025-08-07',
  ]
  const client_builder = (model: string): IChat => {
    let base_client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
    if (oldModels.includes(model)) {
      return openaiBase({ createClient: () => base_client })
    } else {
      return openaiResponse({ createClient: () => base_client })
    }
  }
  return {
    name: 'openai',
    supportModels: [...oldModels, ...newModels],
    requiredEnv: ['OPENAI_API_KEY'],
    invoke: (req) => client_builder(req.model).invoke(req),
    stream: (req, signal) => client_builder(req.model).stream(req, signal),
  }
}
