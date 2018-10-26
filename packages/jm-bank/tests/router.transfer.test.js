const $ = require('./service')

let {user, ct} = require('./consts')

let service = null
let router = null
beforeAll(async () => {
  await $.onReady()
  service = $
  router = $.router()
})

describe('router', async () => {
  test('list', async () => {
    let doc = await router
      .get('/transfers', {rows: 10})
    expect(doc).toBeTruthy()
  })

})
