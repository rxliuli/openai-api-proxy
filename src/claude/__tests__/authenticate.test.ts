import { AnthropicVertexWeb } from '../web'
import { authenticate } from '../authenticate'
import { it, expect } from 'vitest'

it('should authenticate', async () => {
  const token = await authenticate({
    clientEmail: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL!,
    privateKey: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY!,
  })
  expect(token).toBeDefined()
})

it('should call anthropic vertex', async () => {
  const token = await authenticate({
    clientEmail: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL!,
    privateKey: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY!,
  })
  const client = new AnthropicVertexWeb({
    accessToken: token.access_token,
    region: 'us-east5',
    projectId: 'development-334207',
  })
  const response = await client.messages.create({
    messages: [{ role: 'user', content: 'Hello, world!' }],
    model: 'claude-3-5-sonnet@20240620',
    max_tokens: 1000,
  })
  console.log(response)
})

function buildUrl({ region, projectId, model }: { region: string; projectId: string; model: string }) {
  return `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/anthropic/models/${model}:streamRawPredict`
}

it('should authenticate on edge runtime', async () => {
  const token = await authenticate({
    clientEmail: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL!,
    privateKey: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY!,
  })
  expect(token).toBeDefined()
  const url = buildUrl({
    model: 'claude-3-5-sonnet@20240620',
    projectId: 'development-334207',
    region: 'us-east5',
  })
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.access_token}`,
    },
    body: JSON.stringify({
      anthropic_version: 'vertex-2023-10-16',
      messages: [{ role: 'user', content: '你是？' }],
      max_tokens: 100,
      stream: false,
    }),
  })
  console.log(await response.text())
})
