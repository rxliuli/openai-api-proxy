import { Hono } from 'hono'
import { serializeError } from 'serialize-error'
import { HTTPException } from 'hono/http-exception'
import { cors } from 'hono/cors'
import { openAiRouter } from './api/openai'
import { ollamaRouter } from './api/ollama'

export interface Bindings {
  API_KEY: string
  OPENAI_API_KEY: string
}

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
  .use(
    cors({
      origin: (_origin, c) => {
        return c.env.CORS_ORIGIN
      },
    }),
  )
  .use(async (c, next) => {
    await next()
    if (c.error) {
      throw new HTTPException((c.error as any)?.status ?? 500, {
        message: serializeError(c.error).message,
      })
    }
  })

// 生成 openai chat 的代理，https://api.openai.com/v1/chat/completions
app.route('v1', openAiRouter())

// 生成 ollama chat 的代理
app.route('/ollama', ollamaRouter())

export default app
