const $ = require('./service')

let service = null
let router = null
beforeAll(async () => {
  await $.onReady()
  service = $
  router = $.router()
})

function log (doc) {
  console.log(doc)
}

let userId = 'testUserId'
let ctCode = 'cny'
let ctName = '人民币'

describe('router', async () => {
  test('query', async () => {
    let doc = await router
      .get('/query',
        {
          userId: userId,
          ctCode: ctCode
        })

    log(doc)
    expect(doc).toBeTruthy()
  })

  test('transfer by user', async () => {
    let doc = await router
      .post('/transfer', {
        toUserId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })
    log(doc)
    expect(doc).toBeTruthy()
  })

  test('lock', async () => {
    let doc = await router
      .post('/lock', {
        userId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })

    log(doc)
    expect(doc).toBeTruthy()
  })

  test('unlock', async () => {
    let doc = await router
      .post('/unlock', {
        userId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })
    log(doc)
    expect(doc).toBeTruthy()
  })
})
