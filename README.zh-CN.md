# OpenAI API Proxy

## 介绍

为不同的 LLM 模型提供相同的代理 OpenAI API 接口，并且支持部署到任何 Edge Runtime 环境。

支持的模型

- [x] OpenAI
- [x] Anthropic
- [x] Google Vertex Anthropic
- [x] Google Gemini
- [x] DeepSeek

## 部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/rxliuli/openai-api-proxy)

环境变量

- `API_KEY`: 代理 API Key，要求调用代理 API 时必须设置
- `CORS_ORIGIN`: 允许的 CORS 域名，例如 `https://example.com`

- OpenAI: 支持 OpenAI 模型，例如 `gpt-4o-mini`
  - `OPENAI_API_KEY`: OpenAI API Key
- VertexAI Anthropic: 支持 Google Vertex AI 上的 Anthropic 模型，例如 `claude-3-5-sonnet@20240620`
  - `VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL`: Google Cloud Service Account Email
  - `VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY`: Google Cloud Service Account Private Key
  - `VERTEX_ANTROPIC_REGION`: Google Vertex AI Anthropic Region
  - `VERTEX_ANTROPIC_PROJECTID`: Google Vertex AI Anthropic Project ID
- Anthropic: 支持 Anthropic 模型，例如 `claude-3-5-sonnet-20240620`
  - `ANTROPIC_API_KEY`: Anthropic API Key
- Google Gemini: 支持 Google Gemini 模型，例如 `gemini-1.5-flash`
  - `GOOGLE_GEN_AI_API_KEY`: Google Gemini API Key
- DeepSeek: 支持 DeepSeek 模型，例如 `deepseek-chat`
  - `DEEPSEEK_API_KEY`: DeepSeek API Key
- Moonshot: 支持 Moonshot 模型，例如 `moonshot-v1-8k`
  - `MOONSHOT_API_KEY`: Moonshot API Key
- 零一万物: 支持零一万物模型，例如 `yi-large`
  - `LINGYIWANWU_API_KEY`: 零一万物 API Key

## 使用

一旦部署成功，就可以通过 OpenAI 的 API 接口来调用不同的模型。

例如，调用 OpenAI 的 API 接口：

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
     "model": "gpt-4o-mini",
     "messages": [
       {
         "role": "user",
         "content": "Hello, world!"
       }
     ]
   }'
```

或者调用 Anthropic 的 API 接口：

```bash
curl http://localhost:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
     "model": "claude-3-5-sonnet-20240620",
     "messages": [
       {
         "role": "user",
         "content": "Hello, world!"
       }
     ]
   }'
```

并且可以在 OpenAI 的官方 SDK 中使用，例如：

```ts
const openai = new OpenAI({
  baseURL: 'http://localhost:8787/v1',
  apiKey: '$API_KEY',
})

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello, world!' }],
})

console.log(response)
```

## 动机

我正在使用 Vertex AI 的 Anthropic 模型，但发现许多 LLM 工具不支持直接配置它。这促使我萌生了开发一个 API 代理的想法。通过这个代理，我可以在任何支持 OpenAI API 的工具中无缝使用其他 AI 模型。

虽然已经有一些转卖 LLM token 的商业服务，但它们通常需要通过他们的服务器中转。嗯，没必要让另一个第三方知道我如何使用的。这个代理可以部署到任何 Edge Runtime 环境，例如 Cloudflare Workers，对于个人而言，它提供高达 100k/天的免费请求次数。
