import { openaiBase } from './openai'

export function moonshot(env: Record<string, string>) {
  const r = openaiBase(env, {
    baseURL: 'https://api.moonshot.cn/v1',
    apiKey: env.MOONSHOT_API_KEY,
  })
  r.name = 'moonshot'
  r.requiredEnv = ['MOONSHOT_API_KEY']
  r.supportModels = ['moonshot-v1-128k', 'moonshot-v1-8k', 'moonshot-v1-32k']
  return r
}
