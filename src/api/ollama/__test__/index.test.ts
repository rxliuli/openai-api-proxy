import { describe, expect, it } from 'vitest'
import app from '../../../index'
import { pick } from 'lodash-es'
import OpenAI from 'openai'

const MOCK_ENV = {
  API_KEY: import.meta.env.VITE_API_KEY,
  GOOGLE_GEN_AI_API_KEY: import.meta.env.VITE_GOOGLE_GEN_AI_API_KEY,
}

describe('list models', async () => {
  it('no right api key', async () => {
    const r = (await (
      await app.request(
        'ollama/xxx/v1/api/tags',
        {
          headers: {},
        },
        pick(MOCK_ENV, 'API_KEY'),
      )
    ).json()) as OpenAI.Models.ModelsPage

    expect(JSON.stringify(r)).eq('{"error":"Unauthorized"}')
  })

  it('gemini api key', async () => {
    const r = (await (
      await app.request(
        'ollama/123456/v1/api/tags',
        {
          headers: {},
        },
        pick(MOCK_ENV, 'API_KEY'),
      )
    ).json()) as any

    expect(r.models).toEqual([])
  })
})
