import OpenAI from 'openai'
import { IChat } from './base'
import { openaiBase } from './openai'

export function bailian(env: Record<string, string | undefined>): IChat {
  const r = openaiBase({
    createClient: () => {
      return new OpenAI({
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: env.ALIYUN_BAILIAN_API_KEY,
      })
    },
  })
  r.name = 'Bailian'
  r.supportModels = env.ALIYUN_BAILIAN_MODELS?.split(',').map((it) => it.trim()) ?? ['qwen-max']
  r.requiredEnv = ['ALIYUN_BAILIAN_API_KEY']
  return r
}
