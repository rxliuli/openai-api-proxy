import OpenAI from 'openai'
import { describe, expect, it } from 'vitest'
import { openai } from './openai'

describe('OpenAI', () => {
  const client = openai({
    OPENAI_API_KEY: import.meta.env.OPENAI_API_KEY,
  })
  describe('invoke basic', () => {
    it('should invoke chat completion', async () => {
      const resp = await client.invoke({
        messages: [{ role: 'user', content: 'hello' }],
        model: 'gpt-4o-mini',
      })
      expect(resp.choices[0].message.content).toBeTypeOf('string')
    })
    it('should invoke response', async () => {
      const resp = await client.invoke({
        messages: [{ role: 'user', content: 'hello' }],
        model: 'o1',
      })
      expect(resp.choices[0].message.content).toBeTypeOf('string')
    })
  })
  describe('streaming basic', () => {
    it('should streaming chat completion', async () => {
      const stream = client.stream(
        {
          messages: [{ role: 'user', content: 'hello' }],
          model: 'gpt-4o-mini',
          stream: true,
        },
        new AbortController().signal,
      )
      const chunks = await Array.fromAsync(stream)
      const r = chunks.map((it) => it.choices[0].delta.content).join('')
      expect(r).toBeTypeOf('string')
      expect(chunks[0].model.includes('gpt-4o-mini')).true
    })
    it('should streaming chat completion', async () => {
      const stream = client.stream(
        {
          messages: [{ role: 'user', content: 'hello' }],
          model: 'o1',
          stream: true,
        },
        new AbortController().signal,
      )
      const chunks = await Array.fromAsync(stream)
      const r = chunks.map((it) => it.choices[0].delta.content).join('')
      expect(r).toBeTypeOf('string')
      expect(chunks[0].model.includes('o1')).true
    })
  })
  describe('include image', () => {
    it('should invoke chat completion', async () => {
      const resp = await client.invoke({
        messages: [
          { role: 'user', content: 'Describe this image' },
          {
            role: 'user',
            content: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
          },
        ],
        model: 'gpt-4o',
      })
      expect(resp.choices[0].message.content).includes('ant')
      expect(resp.model).includes('gpt-4o')
    })
    it('should invoke chat completion', async () => {
      const resp = await client.invoke({
        messages: [
          { role: 'user', content: 'Describe this image' },
          {
            role: 'user',
            content: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
          },
        ],
        model: 'o1',
      })
      expect(resp.choices[0].message.content).includes('ant')
      expect(resp.model).includes('o1')
    })
  })
}, 15_000)
