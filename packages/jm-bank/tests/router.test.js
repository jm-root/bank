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
  test('query', async () => {
    let doc = await router
      .get('/query',
        {
          userId: user.id,
          ctCode: ct.code
        })
    expect(doc).toBeTruthy()
  })

  test('transfer by user', async () => {
    let doc = await router
      .post('/transfer', {
        toUserId: user.id,
        ctCode: ct.code,
        amount: 1000,
        memo: '测试'
      })
    expect(doc).toBeTruthy()
  })

})
