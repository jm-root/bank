const $ = require('./service')

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $.ct
})

const code = 'cny'
const name = '人民币'

describe('ct', async () => {
  test('find and create', async () => {
    let doc = await service.get({code})
    if (!doc) {
      doc = await service.create({
        code,
        name
      })
    }
    expect(doc.code === code).toBeTruthy()
  })
})
