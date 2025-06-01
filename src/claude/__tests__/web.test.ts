import { expect, it } from 'vitest'
import { AnthropicVertexWeb } from '../web'
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk'
import { authenticate } from '../authenticate'
import { omit } from 'lodash-es'
import { ChatAnthropic } from '@langchain/anthropic'
import { GoogleAuth } from 'google-auth-library'

it('should call anthropic vertex with access token', async () => {
  const token = await authenticate({
    clientEmail: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL!,
    privateKey: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY!,
  })
  const client = new AnthropicVertexWeb({
    region: 'us-east5',
    projectId: 'development-334207',
    accessToken: token.access_token,
  })
  const response = await client.messages.create({
    messages: [{ role: 'user', content: 'Hello, world!' }],
    model: 'claude-3-5-sonnet@20240620',
    max_tokens: 1000,
  })
  console.log(response)
  expect(response).toBeDefined()
})

// 验证自定义的 anthropic vertex client 与原生的 client 一致
it('should call Custom Client and Origin Client', async () => {
  const token = await authenticate({
    clientEmail: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL!,
    privateKey: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY!,
  })
  const custom = new AnthropicVertexWeb({
    region: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
    projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
    accessToken: token.access_token,
  })
  const origin = new AnthropicVertex({
    region: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
    projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
    accessToken: token.access_token,
  })
  function call(client: AnthropicVertexWeb | AnthropicVertex) {
    return client.messages.create({
      messages: [{ role: 'user', content: 'Hello!' }],
      model: 'claude-3-5-sonnet@20240620',
      max_tokens: 1000,
      temperature: 0,
    })
  }
  const [r1, r2] = await Promise.all([call(custom), call(origin)])
  expect(r1).not.undefined
  expect(r2).not.undefined
  expect(omit(r1, 'id')).deep.equal(omit(r2, 'id'))
}, 20_000)

it('Call Anthropic Vertex on nodejs', async () => {
  const client = new AnthropicVertex({
    region: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
    projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
    googleAuth: new GoogleAuth({
      credentials: {
        client_email: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL!,
        private_key: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY!,
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  })
  const chat = new ChatAnthropic({
    apiKey: 'test',
    model: 'claude-3-5-sonnet@20240620',
    createClient: (() => client) as any,
  })
  const response = await chat.invoke([['human', 'Hello!']])
  console.log(response)
  expect(response).not.undefined
})
it('Call Anthropic Vertex on edge runtime', async () => {
  const token = await authenticate({
    clientEmail: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL!,
    privateKey: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY!,
  })
  const client = new AnthropicVertexWeb({
    region: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
    projectId: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
    accessToken: token.access_token,
  })
  const chat = new ChatAnthropic({
    apiKey: 'test',
    model: 'claude-3-5-sonnet@20240620',
    createClient: (() => client) as any,
  })
  const response = await chat.invoke([['human', 'Hello!']])
  console.log(response)
  expect(response).not.undefined
}, 10_000)
