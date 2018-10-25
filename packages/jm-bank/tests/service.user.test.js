const {ObjectId} = require('bson')
const $ = require('./service')

let id = new ObjectId().toString()

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $.user
})

describe('service.user', async () => {
  test('list', async () => {
    let doc = await service.find2()
    expect(doc).toBeTruthy()
    doc = await service.find2({rows: 5})
    expect(doc).toBeTruthy()
  })

  test('get', async () => {
    let doc = await service.get(id)
    expect(doc.id === id).toBeTruthy()
    const defaultAccount = await doc.getDefaultAccount()
    const safeAccount = await doc.getSafeAccount()
    const user = await defaultAccount.getUser()
    expect(defaultAccount.userId === id && safeAccount.userId === id).toBeTruthy()
  })
})
