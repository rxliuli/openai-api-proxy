import { expect, it } from 'vitest'
import { moonshot } from './moonshot'

it('moonshot', async () => {
  const client = moonshot({
    MOONSHOT_API_KEY: import.meta.env.VITE_MOONSHOT_API_KEY,
  })
  const res = await client.invoke({
    model: 'moonshot-v1-8k',
    messages: [{ role: 'user', content: 'Hello!' }],
    temperature: 0,
  })
  expect(res.model).eq('moonshot-v1-8k')
  expect(res.choices[0].message.content).not.undefined
})
