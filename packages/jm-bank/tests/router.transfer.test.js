const $ = require('./service')

let router = null
beforeAll(async () => {
  await $.onReady()
  router = $.router()
})

describe('router', async () => {
  test('list', async () => {
    let doc = await router
      .get('/transfers', { rows: 10 })
    expect(doc).toBeTruthy()
  })
})
