import { expect, it } from 'vitest'
import { auzreOpenAI } from './azure'

it('azure', async () => {
  const llm = auzreOpenAI({
    AZURE_OPENAI_API_KEY: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
    AZURE_API_VERSION: import.meta.env.VITE_AZURE_API_VERSION,
    AZURE_DEPLOYMENT_MODELS: import.meta.env.VITE_AZURE_DEPLOYMENT_MODELS,
  })
  const res = await llm.invoke({
    model: 'azure/gpt-35-turbo',
    messages: [{ role: 'user', content: 'Hello!' }],
    temperature: 0,
  })
  expect(res.choices[0].message.content).not.undefined
})
