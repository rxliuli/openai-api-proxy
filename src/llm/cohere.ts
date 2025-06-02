import { last } from 'lodash-es'
import { ChatEnv, IChat } from './base'
import { Cohere, CohereClient } from 'cohere-ai'
import OpenAI from 'openai'

function roleOpenaiToCohere(role: OpenAI.Chat.Completions.ChatCompletionMessageParam['role']): Cohere.Message['role'] {
  switch (role) {
    case 'user':
      return 'USER'
    case 'assistant':
      return 'CHATBOT'
    case 'system':
      return 'SYSTEM'
    case 'tool':
      return 'TOOL'
    case 'function':
    default:
      throw new Error(`Unsupported role: ${role}`)
  }
}

function finishReasonCohereToOpenAI(
  reason: Cohere.NonStreamedChatResponse['finishReason'],
): OpenAI.ChatCompletion['choices'][number]['finish_reason'] {
  switch (reason) {
    case 'COMPLETE':
      return 'stop'
    case 'ERROR_LIMIT':
      return 'stop'
    case 'STOP_SEQUENCE':
      return 'stop'
    case 'USER_CANCEL':
      return 'stop'
    case 'MAX_TOKENS':
      return 'length'
    case 'ERROR_TOXIC':
      return 'content_filter'
    case 'ERROR':
    default:
      return 'stop'
  }
}

export function cohere(env: ChatEnv): IChat {
  const createClient = () =>
    new CohereClient({
      token: env.COHERE_API_KEY,
    })

  function parseRequest(req: OpenAI.ChatCompletionCreateParams): Cohere.ChatRequest {
    return {
      model: req.model,
      chatHistory: req.messages.slice(0, -1).map(
        (it) =>
          ({
            role: roleOpenaiToCohere(it.role),
            message: it.content as string,
          }) satisfies Cohere.Message,
      ),
      message: last(req.messages)?.content as string,
      temperature: req.temperature!,
      maxTokens: req.max_completion_tokens!,
    }
  }

  function parseResponse(
    resp: Cohere.NonStreamedChatResponse,
    req: OpenAI.ChatCompletionCreateParams,
  ): OpenAI.ChatCompletion {
    return {
      id: resp.generationId ?? 'chatcmpl-' + crypto.randomUUID(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: req.model,
      choices: [
        {
          message: {
            role: 'assistant',
            content: resp.text,
            refusal: null,
          },
          finish_reason: finishReasonCohereToOpenAI(resp.finishReason),
          index: 0,
          logprobs: null,
        },
      ],
      usage:
        resp.meta?.billedUnits?.inputTokens && resp.meta?.billedUnits?.outputTokens
          ? {
              prompt_tokens: resp.meta.billedUnits.inputTokens,
              completion_tokens: resp.meta.billedUnits.outputTokens,
              total_tokens: resp.meta.billedUnits.inputTokens + resp.meta.billedUnits.outputTokens,
            }
          : undefined,
    }
  }

  return {
    name: 'cohere',
    supportModels: [
      'command-r',
      'command-r-plus',
      'command-nightly',
      'command-light-nightly',
      'command',
      'command-r-08-2024',
      'command-r-plus-08-2024',
      'command-light',
    ],
    requiredEnv: ['COHERE_API_KEY'],
    async invoke(req) {
      const client = createClient()
      const resp = await client.chat(parseRequest(req))
      return parseResponse(resp, req)
    },
    async *stream(req, signal) {
      const client = createClient()
      const stream = await client.chatStream(parseRequest(req), {
        abortSignal: signal,
      })
      let id: string = 'chatcmpl-' + crypto.randomUUID()
      const fileds = () =>
        ({
          id: id,
          model: req.model,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
        }) as const
      for await (const chunk of stream) {
        if (chunk.eventType === 'stream-start') {
          id = chunk.generationId
          yield {
            ...fileds(),
            choices: [{ delta: { content: '' }, index: 0, finish_reason: null }],
          } satisfies OpenAI.ChatCompletionChunk
        } else if (chunk.eventType === 'text-generation') {
          yield {
            ...fileds(),
            choices: [
              {
                delta: { content: chunk.text },
                index: 0,
                finish_reason: null,
              },
            ],
          } satisfies OpenAI.ChatCompletionChunk
        } else if (chunk.eventType === 'stream-end') {
          if (!chunk.response.meta?.billedUnits?.inputTokens || !chunk.response.meta?.billedUnits?.outputTokens) {
            throw new Error('Billed units not found')
          }
          yield {
            ...fileds(),
            choices: [
              {
                delta: { content: '' },
                index: 0,
                finish_reason: finishReasonCohereToOpenAI(chunk.finishReason),
              },
            ],
            usage: {
              prompt_tokens: chunk.response.meta.billedUnits.inputTokens,
              completion_tokens: chunk.response.meta.billedUnits.outputTokens,
              total_tokens: chunk.response.meta.billedUnits.inputTokens + chunk.response.meta.billedUnits.outputTokens,
            },
          } satisfies OpenAI.ChatCompletionChunk
        }
      }
    },
  }
}
