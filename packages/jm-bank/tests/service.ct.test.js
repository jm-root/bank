const $ = require('./service')
const { code, name } = require('./consts').ct

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $.ct
})

describe('ct', async () => {
  test('find and create', async () => {
    let doc = null
    try {
      doc = await service.get({ code })
    } catch (e) {
      doc = await service.create({
        code,
        name
      })
    }
    expect(doc.code === code).toBeTruthy()
  })
})
