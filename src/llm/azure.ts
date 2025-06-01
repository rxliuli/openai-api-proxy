import { AzureOpenAI } from 'openai'
import { openaiBase } from './openai'

export function auzreOpenAI(env: Record<string, string>) {
  // model -> deployment
  const map: Record<string, string> = {}
  const r = openaiBase({
    createClient: (req) => {
      return new AzureOpenAI({
        apiKey: env.AZURE_OPENAI_API_KEY,
        endpoint: env.AZURE_OPENAI_ENDPOINT,
        apiVersion: env.AZURE_API_VERSION,
        deployment: map[req.model],
      })
    },
    pre: (req) => ({
      ...req,
      model: req.model.split('/')[1],
      stream: false,
    }),
  })
  r.name = 'azure-openai'
  r.requiredEnv = ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_API_VERSION', 'AZURE_DEPLOYMENT_MODELS']
  r.supportModels = (env.AZURE_DEPLOYMENT_MODELS ?? '').split(',').map((it) => {
    if (it.includes(':')) {
      const [model, deployment] = it.split(':')
      map[model] = deployment
      return `azure/${model}`
    }
    return `azure/${it}`
  })
  return r
}
