import { beforeAll, describe, expect, it } from 'vitest'
import { google } from '../google'
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai'
import { IChat } from '../base'
import OpenAI from 'openai'
import { last } from 'lodash-es'

let llm: IChat
let model: GenerativeModel
beforeAll(() => {
  const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GOOGLE_GEN_AI_API_KEY,
  )
  model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0! },
  })
  llm = google({
    GOOGLE_GEN_AI_API_KEY: import.meta.env.VITE_GOOGLE_GEN_AI_API_KEY,
  })
})

it('google', async () => {
  const [r1, { response: r2 }] = await Promise.all([
    llm.invoke({
      model: 'gemini-1.5-flash',
      messages: [{ role: 'user', content: 'Hello!' }],
      temperature: 0,
    }),
    model.generateContent('Hello!'),
  ])
  expect(r1.choices[0].message.content).eq(r2.text())
  expect(r1.usage).deep.eq({
    prompt_tokens: r2.usageMetadata!.promptTokenCount,
    completion_tokens: r2.usageMetadata!.candidatesTokenCount,
    total_tokens: r2.usageMetadata!.totalTokenCount,
  })
})

describe('stream', () => {
  async function streamByUsage(include_usage: boolean) {
    const s1 = await model.generateContentStream('Hello!')
    const r1 = []
    for await (const chunk of s1.stream) {
      r1.push(chunk)
    }
    const s2 = llm.stream(
      {
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'Hello!' }],
        temperature: 0,
        stream: true,
        stream_options: {
          include_usage: include_usage,
        },
      },
      new AbortController().signal,
    )
    const r2: OpenAI.ChatCompletionChunk[] = []
    for await (const chunk of s2) {
      r2.push(chunk)
    }
    return { r1, r2 }
  }
  it('basic stream', async () => {
    const { r1, r2 } = await streamByUsage(false)
    // console.log(r1, r2)
    expect(r1.map((it) => it.text()).join('')).eq(
      r2.map((it) => it.choices[0].delta.content).join(''),
    )
    expect(last(r2)!.usage).undefined
    expect(last(r1)!.usageMetadata).not.undefined
  })
  it('usage stream', async () => {
    const { r1, r2 } = await streamByUsage(true)
    console.log(r1, r2)
    expect(r1.map((it) => it.text()).join('')).eq(
      r2.map((it) => it.choices[0]?.delta.content ?? '').join(''),
    )
    expect(r2.length - r1.length).eq(1)
    expect(last(r2)!.usage).deep.eq({
      prompt_tokens: last(r1)!.usageMetadata!.promptTokenCount,
      completion_tokens: last(r1)!.usageMetadata!.candidatesTokenCount,
      total_tokens: last(r1)!.usageMetadata!.totalTokenCount,
    })
  })
})
