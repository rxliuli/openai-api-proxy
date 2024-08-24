import { Context, Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { openai } from './llm/openai'
import { anthropic, anthropicVertex } from './llm/anthropic'
import OpenAI from 'openai'
import { uniq } from 'lodash-es'
import { google } from './llm/google'
import { deepseek } from './llm/deepseek'
import { serializeError } from 'serialize-error'
import { HTTPException } from 'hono/http-exception'

interface Bindings {
  API_KEY: string
  OPENAI_API_KEY: string
}

function getModels(env: Record<string, string>) {
  return [
    openai(env),
    anthropic(env),
    anthropicVertex(env),
    google(env),
    deepseek(env),
  ].filter((it) => it.requiredEnv.every((it) => it in env))
}

// 生成 openai chat 的代理，https://api.openai.com/v1/chat/completions
const app = new Hono<{
  Bindings: Bindings
}>()
  /*
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
     "model": "gpt-4o-mini",
     "messages": [{"role": "user", "content": "Say this is a test!"}],
     "temperature": 0.7
   }'
*/
  .use(async (c, next) => {
    if (!c.env.API_KEY) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    if (`Bearer ${c.env.API_KEY}` !== c.req.header('Authorization')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    return next()
  })
  .use(async (c, next) => {
    await next()
    if (c.error) {
      throw new HTTPException((c.error as any)?.status ?? 500, {
        message: serializeError(c.error).message,
      })
    }
  })
  .post('/v1/chat/completions', async (c) => {
    const req = (await c.req.json()) as
      | OpenAI.ChatCompletionCreateParamsNonStreaming
      | OpenAI.ChatCompletionCreateParamsStreaming
    const list = getModels(c.env as any)
    const llm = list.find((it) => it.supportModels.includes(req.model))
    if (!llm) {
      return c.json({ error: `Model ${req.model} not supported` }, 400)
    }
    if (req.stream) {
      const abortController = new AbortController()
      return streamSSE(c, async (stream) => {
        stream.onAbort(() => abortController.abort())
        for await (const it of llm.stream(req, abortController.signal)) {
          stream.writeSSE({ data: JSON.stringify(it) })
        }
      })
    }
    return c.json(await llm?.invoke(req))
  })
  .get('/v1/models', async (c) => {
    const list = uniq(getModels(c.env as any).flatMap((it) => it.supportModels))
    return c.json({
      object: 'list',
      data: list.map(
        (it) =>
          ({
            id: it,
            object: 'model',
            owned_by: 'system',
            created: Math.floor(Date.now() / 1000),
          } as OpenAI.Models.Model),
      ),
    } as OpenAI.Models.ModelsPage)
  })

export default app
