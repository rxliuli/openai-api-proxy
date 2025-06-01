# OpenAI API Proxy

## 介绍

为不同的 LLM 模型提供相同的代理 OpenAI API 接口 和 Ollama API 接口，并且支持部署到任何 Edge Runtime 环境。

支持的模型

- [x] OpenAI
- [x] Anthropic
- [x] Google Vertex Anthropic
- [x] Google Gemini
- [x] DeepSeek
- [x] Groq
- [x] Moonshot
- [x] 零一万物
- [x] Cerebras
- [x] Azure OpenAI
- [x] Cohere
- [x] Aliyun Bailian
- [x] Ollama
- [x] Grok
- [x] OpenRouter
- [ ] Cloudflare Workers AI
- [ ] Coze
- [ ] 豆包

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
- Groq: 支持 Groq 模型，例如 `llama3-8b-8192`
  - `GROQ_API_KEY`: Groq API Key
- Cerebras: 支持 Cerebras 模型，例如 `llama-3-8b`
  - `CEREBRAS_API_KEY`: Cerebras API Key
- Azure OpenAI: 支持 Azure OpenAI 模型，例如 `gpt-4o-mini`
  - `AZURE_OPENAI_API_KEY`: Azure OpenAI API Key
  - `AZURE_OPENAI_ENDPOINT`: Azure OpenAI Endpoint
  - `AZURE_API_VERSION`: Azure OpenAI API Version
  - `AZURE_DEPLOYMENT_MODELS`: Azure OpenAI Deployment Models, 例如 `gpt-4o-mini:gpt-4o-mini-dev,gpt-35-turbo:gpt-35-dev`，表示 `gpt-4o-mini` 和 `gpt-35-turbo` 两个模型，分别对应 `gpt-4o-mini-dev` 和 `gpt-35-dev` 两个部署。
- Cohere: 支持 Cohere 模型，例如 `command-r`
  - `COHERE_API_KEY`: Cohere API Key
- Aliyun Bailian: 支持阿里云百炼模型，例如 `qwen-max`
  - `ALIYUN_BAILIAN_API_KEY`: 阿里云百炼 API Key
  - `ALIYUN_BAILIAN_MODELS`: 自定义支持的阿里云百炼模型列表，例如 `qwen-max,qwen-7b-chat`，默认为 `qwen-max`
- Ollama: 支持 Ollama 模型，例如 `deepseek-r1`
  - `OLLAMA_BASE_URL`: Ollama Base URL, 例如 `http://localhost:11434/v1`
  - `OLLAMA_MODELS`: Ollama Models, 例如 `deepseek-r1,lama3.3:70b,phi4:latest`
- OpenRouter: 支持 OpenRouter 模型，例如 `openai/gpt-4o-mini`
  - `OPENROUTER_API_KEY`: OpenRouter API Key
  - `OPENROUTER_MODELS`: OpenRouter Models, 例如 `openai/gpt-4o-mini,anthropic/claude-3-5-sonnet-20240620`
- Grok: 支持 grok3 系列模型, e.g. `grok-3-latest`, `grok-3-mini-latest`
  - `GROK_API_KEY`: Grok API key

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

Ollama API的接口:

Ollama为本地模型服务,类似IntelliJ IDEA不支持自定义header,因此采取AK放路径思路.在IntelliJ内可以配置`https://$YOUR_HOST/ollama/$API_KEY/v1`

```bash
curl http://localhost:8787/ollama/$API_KEY/v1/api/chat \
  -H "Content-Type: application/json" \
  -d '{
  "model": "gemini-2.0-flash",
  "stream": true,
  "messages": [
    {
      "role": "user",
      "content": "Hello, world!"
    }
  ]
}'
```

### OpenAI 兼容性

- [/v1/chat/completions](https://platform.openai.com/docs/api-reference/chat/create)
- [/v1/models](https://platform.openai.com/docs/api-reference/models)

### Ollama API 兼容性

- [/api/chat](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)
- [/api/tags](https://github.com/ollama/ollama/blob/main/docs/api.md#list-local-models)

### 支持的模型列表

由于一些模型在多个供应商中存在，所以一些模型的名称可能会添加前缀，例如 `groq/llama3-8b-8192`，表示 Groq 的 `llama3-8b-8192` 模型。

通过 API 获取支持的模型列表：

```bash
curl http://localhost:8787/v1/models \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json"
```

## 动机

我正在使用 Vertex AI 的 Anthropic 模型，但发现许多 LLM 工具不支持直接配置它。这促使我萌生了开发一个 API 代理的想法。通过这个代理，我可以在任何支持 OpenAI API 的工具中无缝使用其他 AI 模型。

虽然已经有一些转卖 LLM token 的商业服务，但它们通常需要通过他们的服务器中转。嗯，没必要让另一个第三方知道我如何使用的。这个代理可以部署到任何 Edge Runtime 环境，例如 Cloudflare Workers，对于个人而言，它提供高达 100k/天的免费请求次数。
