# OpenAI API Proxy

## Introduction

Provides the same proxy OpenAI API interface for different LLM models, and supports deployment to any Edge Runtime environment.

Supported models

- [x] OpenAI
- [x] Anthropic
- [x] Google Vertex Anthropic
- [x] Google Gemini
- [x] DeepSeek
- [x] Groq

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

### OpenAI Compatibility

- [/v1/chat/completions](https://platform.openai.com/docs/api-reference/chat/create)
- [/v1/models](https://platform.openai.com/docs/api-reference/models)

## Motivation

I'm using Vertex AI's Anthropic model, but found that many LLM tools don't support configuring it directly. This prompted me to develop an API proxy. With this proxy, I can seamlessly use other AI models in any tool that supports the OpenAI API.

Although there are some commercial services that resell LLM tokens, they usually require routing through their servers. Well, there's no need for another third party to know how I'm using it. This proxy can be deployed to any Edge Runtime environment, such as Cloudflare Workers, which provides up to 100k free requests per day for individuals.
