import OpenAI from 'openai'
import { it } from 'vitest'

it.todo('OpenAI invoke basic')
it.todo('OpenAI invoke include image of private', () => {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  })
  const res = client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe this image',
          },
          {
            type: 'image_url',
            image_url: {
              url: 'https://example.com/image.png',
            },
          },
        ],
      },
    ],
  })
})
// https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg
it.todo('OpenAI invoke include image of public')
it.todo('OpenAI invoke include system')
it.todo('OpenAI streaming basic')
it.todo('OpenAI streaming include image', () => {})
it.todo('OpenAI streaming include system')
