import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import app from '..'
import OpenAI from 'openai'
import { omit, pick } from 'lodash-es'
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk'
import { GoogleAuth } from 'google-auth-library'
import { TextBlock } from '@anthropic-ai/sdk/resources/messages.mjs'
import { anthropic } from '../llm/anthropic'

const MOCK_ENV = {
  API_KEY: import.meta.env.VITE_API_KEY,

  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL,
  VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY,
  VERTEX_ANTROPIC_REGION: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
  VERTEX_ANTROPIC_PROJECTID: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
  ANTROPIC_API_KEY: import.meta.env.VITE_ANTROPIC_API_KEY,
}

let mock: OpenAI
beforeAll(() => {
  mock = new OpenAI({
    apiKey: import.meta.env.VITE_API_KEY,
    fetch: async (_url, init) => {
      return app.request('/v1/chat/completions', { method: 'POST', ...init }, MOCK_ENV)
    },
  })
})

describe('invoke', () => {
  async function invokeOpenAI(chat: OpenAI, model: string) {
    return await chat.chat.completions.create({
      model,
      temperature: 0,
      messages: [{ role: 'user', content: 'Hello!' }],
    })
  }
  describe('openai api', () => {
    let origin: OpenAI
    beforeEach(() => {
      origin = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      })
    })
    it('call openai invoke function', async () => {
      const [r1, r2] = await Promise.all([invokeOpenAI(origin, 'gpt-4o-mini'), invokeOpenAI(mock, 'gpt-4o-mini')])
      expect(r1).not.undefined
      expect(r2).not.undefined
      expect(omit(r1, 'created', 'id', 'system_fingerprint')).deep.equal(
        omit(r2, 'created', 'id', 'system_fingerprint'),
      )
    })
  })

  describe('vertex api', () => {
    let origin: AnthropicVertex
    beforeEach(() => {
      origin = new AnthropicVertex({
        projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
        region: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
        googleAuth: new GoogleAuth({
          projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
          credentials: {
            type: 'service_account',
            client_email: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL,
            private_key: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY,
          },
        }),
      })
    })
    it('call vertex invoke function', async () => {
      const [r1, r2] = await Promise.all([
        origin.messages.create({
          model: 'claude-3-5-sonnet@20240620',
          max_tokens: 1000,
          temperature: 0,
          messages: [{ role: 'user', content: 'Hello!' }],
        }),
        invokeOpenAI(mock, 'claude-3-5-sonnet@20240620'),
      ])
      expect(r1).not.undefined
      expect(r2).not.undefined
      // console.log('r1: ', r1)
      // console.log('r2: ', r2)
      expect((r1.content[0] as TextBlock).text).equal(r2.choices[0].message.content)
      expect(r1.model).equal(r2.model)
      expect({
        prompt_tokens: r1.usage.input_tokens,
        completion_tokens: r1.usage.output_tokens,
        total_tokens: r1.usage.input_tokens + r1.usage.output_tokens,
      }).deep.equal(r2.usage)
    }, 10_000)

    it('call vertex-ai claude 3 haiku', async () => {
      const r = await invokeOpenAI(mock, 'claude-3-haiku@20240307')
      expect(r.model).eq('claude-3-haiku-20240307')
    })
  })
})

describe('stream', () => {
  async function streamOpenAI(chat: OpenAI, model: string) {
    const stream = await chat.chat.completions.create({
      model: model,
      temperature: 0,
      messages: [{ role: 'user', content: 'Hello!' }],
      stream: true,
      stream_options: {
        include_usage: true,
      },
    })
    const res: OpenAI.Chat.Completions.ChatCompletionChunk[] = []
    for await (const it of stream) {
      res.push(it)
    }
    return res
  }
  describe('openai api', () => {
    let origin: OpenAI
    beforeEach(() => {
      origin = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      })
    })
    it('call openai stream function', async () => {
      const [r1, r2] = await Promise.all([streamOpenAI(origin, 'gpt-4o-mini'), streamOpenAI(mock, 'gpt-4o-mini')])
      // console.log(JSON.stringify(r1, null, 2))
      const f = (it: OpenAI.Chat.Completions.ChatCompletionChunk) => omit(it, 'created', 'id', 'system_fingerprint')
      // console.log(JSON.stringify(r2, null, 2))
      expect(r1.map(f)).deep.equal(r2.map(f))
    })
  })

  describe('vertex api', () => {
    let client: AnthropicVertex
    beforeEach(() => {
      client = new AnthropicVertex({
        projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
        region: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
        googleAuth: new GoogleAuth({
          projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
          credentials: {
            type: 'service_account',
            client_email: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL,
            private_key: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY,
          },
        }),
      })
    })

    it('call vertex stream function', async () => {
      const [r1, r2] = await Promise.all([
        client.messages.stream({
          model: 'claude-3-5-sonnet@20240620',
          max_tokens: 1000,
          temperature: 0,
          messages: [{ role: 'user', content: 'Hello!' }],
          stream: true,
        }),
        streamOpenAI(mock, 'claude-3-5-sonnet@20240620'),
      ])
      const message = await r1.finalMessage()
      const usage = r2.find((it) => it.usage)!.usage!
      const content = r2.map((it) => it.choices[0]?.delta.content ?? '').join('')
      expect((message.content[0] as TextBlock).text).equal(content)
      expect(usage.prompt_tokens).equal(message.usage.input_tokens)
      expect(usage.completion_tokens).equal(message.usage.output_tokens)
    })
  })
})

describe('list models', async () => {
  it('no api key', async () => {
    const r = (await (
      await app.request(
        '/v1/models',
        {
          headers: { Authorization: 'Bearer ' + import.meta.env.VITE_API_KEY },
        },
        pick(MOCK_ENV, 'API_KEY'),
      )
    ).json()) as OpenAI.Models.ModelsPage
    expect(r.data).empty
  })
  it('anthropic api key', async () => {
    const r = (await (
      await app.request(
        '/v1/models',
        {
          headers: {
            Authorization: 'Bearer ' + import.meta.env.VITE_API_KEY,
          },
        },
        pick(MOCK_ENV, 'API_KEY', 'ANTROPIC_API_KEY'),
      )
    ).json()) as OpenAI.Models.ModelsPage
    expect(r.data.map((it) => it.id)).deep.eq(anthropic(MOCK_ENV).supportModels)
  })
  it('openai api key', async () => {
    const client = new OpenAI({
      apiKey: import.meta.env.VITE_API_KEY,
      fetch: async (_url, init) => {
        return app.request('/v1/models', init, MOCK_ENV)
      },
    })
    const r = await client.models.list()
    expect(r.data).not.empty
  })
})
