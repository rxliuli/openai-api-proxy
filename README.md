# OpenAI API Proxy

## Introduction

Provides the same proxy OpenAI API and Ollama API interface for different LLM models, and supports deployment to any Edge Runtime environment.

Supported models

- [x] OpenAI
- [x] Anthropic
- [x] Google Vertex Anthropic
- [x] Google Gemini
- [x] DeepSeek
- [x] Groq
- [x] Cerebras
- [x] Azure OpenAI
- [x] Cohere
- [x] Aliyun Bailian
- [x] Ollama
- [x] Grok
- [x] OpenRouter
- [ ] Cloudflare Workers AI
- [ ] Coze

## Deployment

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/rxliuli/openai-api-proxy)

Environment variables

- `API_KEY`: Proxy API Key, required when calling the proxy API
- `CORS_ORIGIN`: Allowed CORS domain, e.g. `https://example.com`

- OpenAI: Supports OpenAI models, e.g. `gpt-4o-mini`
  - `OPENAI_API_KEY`: OpenAI API Key
- VertexAI Anthropic: Supports Anthropic models on Google Vertex AI, e.g. `claude-3-5-sonnet@20240620`
  - `VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL`: Google Cloud Service Account Email
  - `VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY`: Google Cloud Service Account Private Key
  - `VERTEX_ANTROPIC_REGION`: Google Vertex AI Anthropic Region
  - `VERTEX_ANTROPIC_PROJECTID`: Google Vertex AI Anthropic Project ID
- Anthropic: Supports Anthropic models, e.g. `claude-3-5-sonnet-20240620`
  - `ANTROPIC_API_KEY`: Anthropic API Key
- Google Gemini: Supports Google Gemini models, e.g. `gemini-1.5-flash`
  - `GOOGLE_GEN_AI_API_KEY`: Google Gemini API Key
- DeepSeek: Supports DeepSeek models, e.g. `deepseek-chat`
  - `DEEPSEEK_API_KEY`: DeepSeek API Key
- Groq: Supports Groq models, e.g. `llama3-8b-8192`
  - `GROQ_API_KEY`: Groq API Key
- Cerebras: Supports Cerebras models, e.g. `llama-3-8b`
  - `CEREBRAS_API_KEY`: Cerebras API Key
- Azure OpenAI: Supports Azure OpenAI models, e.g. `gpt-4o-mini`
  - `AZURE_OPENAI_API_KEY`: Azure OpenAI API Key
  - `AZURE_OPENAI_ENDPOINT`: Azure OpenAI Endpoint
  - `AZURE_API_VERSION`: Azure OpenAI API Version
  - `AZURE_DEPLOYMENT_MODELS`: Azure OpenAI Deployment Models, such as `gpt-4o-mini:gpt-4o-mini-dev,gpt-35-turbo:gpt-35-dev`, represent two models, `gpt-4o-mini` and `gpt-35-turbo`, corresponding to two deployments, `gpt-4o-mini-dev` and `gpt-35-dev` respectively.
- Cohere: Supports Cohere models, e.g. `command-r`
  - `COHERE_API_KEY`: Cohere API Key
- Aliyun Bailian: Supports Aliyun Bailian models, e.g. `qwen-max`
  - `ALIYUN_BAILIAN_API_KEY`: Aliyun Bailian API Key
  - `ALIYUN_BAILIAN_MODELS`: Custom supported Aliyun Bailian models, e.g. `qwen-max,qwen-7b-chat`, default to `qwen-max`
- Ollama:
  - `OLLAMA_BASE_URL`: Ollama Base URL, e.g. `http://localhost:11434/v1`
  - `OLLAMA_MODELS`: Ollama Models, e.g. `deepseek-r1,lama3.3:70b,phi4:latest`
- OpenRouter: Supports OpenRouter models, e.g. `openai/gpt-4o-mini`
  - `OPENROUTER_API_KEY`: OpenRouter API Key
  - `OPENROUTER_MODELS`: OpenRouter Models, e.g. `openai/gpt-4o-mini,anthropic/claude-3-5-sonnet-20240620`
- Grok: Supports grok3 models, e.g. `grok-3-latest`, `grok-3-mini-latest`
  - `GROK_API_KEY`: Grok API key

## Usage

Once deployed successfully, you can call different models through OpenAI's API interface.

For example, calling OpenAI's API interface:

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

Or calling Anthropic's API interface:

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

And it can be used in OpenAI's official SDK, for example:

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

And Ollama API interface:

Ollama provides local model serving. Since some clients, similar to certain IntelliJ IDEA integrations, don't support custom headers, the approach of placing the API Key (AK) in the path was adopted. Therefore, within IntelliJ, you can configure the endpoint as `http://localhost:8787/ollama/$API_KEY/v1`

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

### OpenAI Compatibility

- [/v1/chat/completions](https://platform.openai.com/docs/api-reference/chat/create)
- [/v1/models](https://platform.openai.com/docs/api-reference/models)

### Ollama Compatibility

- [/api/chat](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)
- [/api/tags](https://github.com/ollama/ollama/blob/main/docs/api.md#list-local-models)

### Supported Models

Due to some models existing across multiple vendors, certain model names may have prefixes added, such as `groq/llama3-8b-8192`, indicating Groq's `llama3-8b-8192` model.

Get a list of supported models via API:

```bash
curl http://localhost:8787/v1/models \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json"
```

## Motivation

I'm using Vertex AI's Anthropic model, but found that many LLM tools don't support configuring it directly. This prompted me to develop an API proxy. With this proxy, I can seamlessly use other AI models in any tool that supports the OpenAI API.

Although there are some commercial services that resell LLM tokens, they usually require routing through their servers. Well, there's no need for another third party to know how I'm using it. This proxy can be deployed to any Edge Runtime environment, such as Cloudflare Workers, which provides up to 100k free requests per day for individuals.
