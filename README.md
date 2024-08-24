# OpenAI API Proxy

## Introduction

Provides the same agent OpenAI API interface for different LLM models and supports deployment to any Edge Runtime environment.

Supported models

- [x] OpenAI
- [x] Anthropic
- [x] Google Vertex Anthropic
- [x] Google Gemini
- [ ] DeepSeek

## Deployment

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/rxliuli/openai-api-proxy)

Environment variables

- `API_KEY`: proxy API Key, which must be set when calling the proxy API

- OpenAI: Support OpenAI models, such as `gpt-4o-mini`
  - `OPENAI_API_KEY`: OpenAI API Key
- VertexAI Anthropic: Support Anthropic models on Google Vertex AI, such as `claude-3-5-sonnet@20240620`
  - `VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL`: Google Cloud Service Account Email
  - `VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY`: Google Cloud Service Account Private Key
  - `VERTEX_ANTROPIC_REGION`: Google Vertex AI Anthropic Region
  - `VERTEX_ANTROPIC_PROJECTID`: Google Vertex AI Anthropic Project ID
- Anthropic: Support Anthropic models, such as `claude-3-5-sonnet-20240620`
  - `ANTROPIC_API_KEY`: Anthropic API Key
- Google Gemini: Support Google Gemini models, such as `gemini-1.5-flash`
  - `GOOGLE_GEN_AI_API_KEY`: Google Gemini API Key

## Usage

Once deployed successfully, different models can be called through OpenAI’s API interface.

For example, calling OpenAI’s API interface:

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

Or call Anthropic’s API interface:

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

And can be used in OpenAI’s official SDK, for example:

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
