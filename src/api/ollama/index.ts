import { Context, Hono } from 'hono'
import { Bindings } from '../../index'
import OpenAI from 'openai'
import { getModels } from '../common'
import { streamSSE } from 'hono/streaming'

export function ollamaRouter(): Hono<{ Bindings: Bindings }> {
  const app = new Hono<{
    Bindings: Bindings
  }>().basePath('/:apiKey')

  app.use('*', async (c, next) => {
    const apiKey = c.req.param('apiKey')

    if (!c.env.API_KEY) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (apiKey !== c.env.API_KEY) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    return next() // Proceed only if authorized
  })

  // 我也不知道hono在这里怎么路由的。。。。都加肯定对
  app.get('/v1/', async (c) => {
    return c.text('Ollama is running')
  })
  app.get('/v1', async (c) => {
    return c.text('Ollama is running')
  })

  app.post('/v1/api/chat', completions)

  app.get('/v1/api/tags', models)

  return app
}

async function completions(c: Context<{ Bindings: Bindings }>) {
  const req = (await c.req.json()) as
    | OpenAI.ChatCompletionCreateParamsNonStreaming
    | OpenAI.ChatCompletionCreateParamsStreaming

  const list = getModels(c.env as any)
  const llm = list.find((it) => it.supportModels.includes(req.model))
  if (!llm) {
    return c.json({ error: `Model ${req.model} not supported` }, 400)
  }
  // console.log(req, llm.name)
  if (req.stream) {
    const abortController = new AbortController()
    return streamSSE(
      c,
      async (stream) => {
        stream.onAbort(() => abortController.abort())
        for await (const it of llm.stream(req, abortController.signal)) {
          stream.write(JSON.stringify(convertOpenaiChunkToOllama(it)) + '\n')
        }
      },
      async (err, stream) => {
        await stream.writeSSE({
          data:
            JSON.stringify({
              error: err.message,
            }) + '\n',
        })
        return stream.close()
      },
    )
  }
  return c.json(convertOpenaiToOllama(await llm?.invoke(req)))
}

async function models(c: Context<{ Bindings: Bindings }>) {
  return c.json({
    models: getModels(c.env as any).flatMap((it) => {
      return it.supportModels.map((model) => ({
        name: model,
        model: model,
        details: {},
        created: Math.floor(Date.now() / 1000),
        modified_at: Math.floor(Date.now() / 1000),
      }))
    }),
  })
}

function convertOpenaiChunkToOllama(req: OpenAI.ChatCompletionChunk) {
  return {
    model: req.model,
    created_at: new Date(req.created).toISOString(),
    message: {
      role: 'assistant',
      content: req.choices[0].delta?.content,
      tool_calls: req.choices[0].delta?.tool_calls,
    },
    done_reason: req.choices[0].finish_reason,
    done: req.choices[0].finish_reason === 'stop',
    prompt_eval_count: req.usage?.prompt_tokens,
    eval_count: req.usage?.completion_tokens,
  }
}

function convertOpenaiToOllama(req: OpenAI.ChatCompletion) {
  return {
    model: req.model,
    created_at: new Date(req.created * 1000).toISOString(),
    message: {
      role: 'assistant',
      content: req.choices[0].message.content,
      tool_calls: req.choices[0].message.tool_calls,
    },
    done_reason: req.choices[0].finish_reason,
    done: req.choices[0].finish_reason === 'stop',
    prompt_eval_count: req.usage?.prompt_tokens,
    eval_count: req.usage?.completion_tokens,
  }
}
