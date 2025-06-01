import { beforeAll, expect, it } from 'vitest'
import { anthropicVertex, getImageAsBase64, IAnthropicVertex } from './anthropic'

let client: IAnthropicVertex
beforeAll(() => {
  client = anthropicVertex({
    VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_CLIENT_EMAIL,
    VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY: import.meta.env.VITE_VERTEX_ANTROPIC_GOOGLE_SA_PRIVATE_KEY,
    VERTEX_ANTROPIC_REGION: import.meta.env.VITE_VERTEX_ANTROPIC_REGION,
    VERTEX_ANTROPIC_PROJECTID: import.meta.env.VITE_VERTEX_ANTROPIC_PROJECTID,
  })
})

it('image input', async () => {
  const res = await client.invoke({
    model: 'claude-3-5-sonnet@20240620',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe the image',
          },
          {
            type: 'image_url',
            image_url: {
              url: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
            },
          },
        ],
      },
    ],
  })
  expect(res.choices[0].message.content).include('ant')
}, 10_000)

it('data url image input', async () => {
  const image = await getImageAsBase64(
    'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
  )
  const dataUri = `data:${image.media_type};base64,${image.data}`
  const res = await client.invoke({
    model: 'claude-3-5-sonnet@20240620',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe the image',
          },
          {
            type: 'image_url',
            image_url: { url: dataUri },
          },
        ],
      },
    ],
  })
  expect(res.choices[0].message.content).include('ant')
}, 10_000)
