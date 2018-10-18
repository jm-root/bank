const {ObjectId} = require('bson')
const $ = require('./service')

let id = new ObjectId().toString()

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $.user
})

describe('service.user', async () => {
  test('get', async () => {
    let doc = await service.get(id)
    console.log(doc.id)
    expect(doc.id === id).toBeTruthy()
  })
})
