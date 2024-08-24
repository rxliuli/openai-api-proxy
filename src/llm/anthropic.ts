import { Context } from 'hono'
import OpenAI from 'openai'
import type AnthropicTypes from '@anthropic-ai/sdk'
import { AnthropicVertexWeb } from '../claude/web'
import { IChat } from './base'
import Anthropic from '@anthropic-ai/sdk'

interface IAnthropicVertex extends IChat {
  parseRequest(
    req: OpenAI.ChatCompletionCreateParams,
  ): AnthropicTypes.MessageCreateParams
  parseResponse(resp: AnthropicTypes.Messages.Message): OpenAI.ChatCompletion
}

function convertToolChoice(
  tool_choice?: OpenAI.ChatCompletionToolChoiceOption,
): AnthropicTypes.MessageCreateParams['tool_choice'] | undefined {
  if (!tool_choice) {
    return
  }
  if (tool_choice === 'auto') {
    return {
      type: 'auto',
    }
  }
  if (tool_choice === 'required') {
    return {
      type: 'any',
    }
  }
  if (tool_choice === 'none') {
    return
  }
  return {
    type: 'tool',
    name: tool_choice.function.name,
  }
}

export function anthropicBase(
  createClient: () => AnthropicTypes,
): Omit<IAnthropicVertex, 'requiredEnv' | 'supportModels'> {
  return {
    name: 'anthropic-vertex',
    parseRequest(req) {
      let r: AnthropicTypes.MessageCreateParamsNonStreaming = {
        stream: false,
        stop_sequences:
          typeof req.stop === 'string'
            ? [req.stop]
            : Array.isArray(req.stop)
            ? req.stop
            : undefined,
        system: req.messages.find((it) => it.role === 'system')?.content,
        model: req.model,
        messages: req.messages
          .filter((it) =>
            (
              [
                'user',
                'assistant',
              ] as OpenAI.ChatCompletionMessageParam['role'][]
            ).includes(it.role),
          )
          .map(
            (it) =>
              ({
                role: it.role,
                content: it.content,
              } as AnthropicTypes.MessageParam),
          ),
        max_tokens: req.max_tokens ?? 1000,
        temperature: req.temperature!,
        metadata: {
          user_id: req.user,
        },
        tools: req.tools?.map(
          (it) =>
            ({
              name: it.function.name,
              description: it.function.description,
              input_schema: it.function.parameters,
            } as AnthropicTypes.Tool),
        ),
        tool_choice: convertToolChoice(req.tool_choice),
      }
      if (!req.stream) {
        return r
      }
      return {
        ...r,
        stream: true,
      } as AnthropicTypes.MessageCreateParamsStreaming
    },
    parseResponse(resp) {
      return {
        id: resp.id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: resp.model,
        usage: {
          prompt_tokens: resp.usage.input_tokens,
          completion_tokens: resp.usage.output_tokens,
          total_tokens: resp.usage.input_tokens + resp.usage.output_tokens,
        },
        choices: resp.content.map((it) => {
          return {
            index: 0,
            message: {
              role: 'assistant',
              content: it.type === 'text' ? it.text : undefined,
              refusal: null,
              tool_calls:
                it.type === 'text'
                  ? undefined
                  : [
                      {
                        id: it.id,
                        type: 'function',
                        function: {
                          name: it.name,
                          arguments: it.input,
                        },
                      },
                    ],
            },
            finish_reason: 'stop',
            logprobs: null,
          }
        }),
      } as OpenAI.ChatCompletion
    },
    async invoke(req) {
      const client = createClient()
      return this.parseResponse(
        await client.messages.create(
          this.parseRequest(
            req,
          ) as AnthropicTypes.MessageCreateParamsNonStreaming,
        ),
      )
    },
    async *stream(req, signal) {
      const client = createClient()
      const stream = await client.messages.create({
        ...this.parseRequest(req),
        stream: true,
      })
      signal.onabort = () => stream.controller.abort()
      const chunks: AnthropicTypes.Messages.RawMessageStreamEvent[] = []
      let start: AnthropicTypes.Messages.Message | undefined
      for await (const it of stream) {
        chunks.push(it)
        const fileds = () => ({
          id: start!.id,
          model: start!.model,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
        })
        if (it.type === 'message_start') {
          start = it.message
        } else if (it.type === 'content_block_delta') {
          if (it.delta.type !== 'text_delta') {
            throw new Error('Unsupported delta type')
          }
          yield {
            ...fileds(),
            choices: [
              {
                index: it.index,
                delta: {
                  content: it.delta.text,
                },
              },
            ],
          } as OpenAI.ChatCompletionChunk
        } else if (it.type === 'message_delta') {
          if (req.stream_options?.include_usage) {
            yield {
              ...fileds(),
              choices: [],
              usage: {
                prompt_tokens: start!.usage.input_tokens,
                completion_tokens: it!.usage.output_tokens,
                total_tokens:
                  start!.usage.input_tokens + it!.usage.output_tokens,
              },
            } as OpenAI.ChatCompletionChunk
          } else {
            yield {
              ...fileds(),
              choices: [
                {
                  index: 0,
                  delta: {},
                  finish_reason: 'stop',
                },
              ],
            } as OpenAI.ChatCompletionChunk
          }
        }
      }
    },
  }
}

export function anthropicVertex(env: Record<string, string>): IAnthropicVertex {
  const createClient = () =>
    new AnthropicVertexWeb({
      clientEmail: env.VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL,
      privateKey: env.VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY,
      region: env.VERTEX_ANTROPIC_REGION,
      projectId: env.VERTEX_ANTROPIC_PROJECTID,
    })
  const r = anthropicBase(createClient as any) as IAnthropicVertex
  r.requiredEnv = [
    'VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL',
    'VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY',
    'VERTEX_ANTROPIC_REGION',
    'VERTEX_ANTROPIC_PROJECTID',
  ]
  r.supportModels = [
    'claude-3-5-sonnet@20240620',
    'claude-3-haiku@20240307',
    'claude-3-opus@20240229',
    'claude-3-sonnet@20240229',
  ]
  return r
}

export function anthropic(env: Record<string, string>): IAnthropicVertex {
  const createClient = () => new Anthropic({ apiKey: env.ANTROPIC_API_KEY })
  const r = anthropicBase(createClient as any) as IAnthropicVertex
  r.requiredEnv = ['ANTROPIC_API_KEY']
  r.supportModels = [
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ]
  return r
}
