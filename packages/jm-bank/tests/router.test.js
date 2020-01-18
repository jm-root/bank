const $ = require('./service')

let { user, ct } = require('./consts')

let service = null
let router = null
beforeAll(async () => {
  await $.onReady()
  service = $
  router = $.router()
})

function tUser (opts) {
  opts.ctCode = ct.code
  return router
    .post('/transfer', opts)
}

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
    let doc = null

    doc = await tUser({
      toUserId: user.id,
      amount: 100
    })
    expect(doc).toBeTruthy()

    doc = await tUser({
      fromUserId: user.id,
      toUserId: user.id1,
      amount: 100
    })
    expect(doc).toBeTruthy()

    try {
      doc = await tUser({
        fromUserId: user.id2,
        toUserId: user.id,
        amount: 100
      })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('transfer by account', async () => {
    let doc = null

    doc = await service.user.get(user.id)
    const accountId = doc.accountId

    doc = await service.user.get(user.id1)
    const accountId1 = doc.accountId

    doc = await tUser({
      toAccountId: accountId,
      amount: 100
    })
    expect(doc).toBeTruthy()

    doc = await tUser({
      fromAccountId: accountId,
      toAccountId: accountId1,
      allAmount: 1
    })
    expect(doc).toBeTruthy()

    try {
      doc = await tUser({
        fromAccountId: accountId,
        toAccountId: accountId1,
        amount: 100 * 100 * 10000
      })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('transfer safe account', async () => {
    let doc = null

    doc = await service.user.get(user.id)
    const accountId = doc.safeAccountId

    doc = await tUser({
      toUserId: user.id,
      amount: 100
    })
    expect(doc).toBeTruthy()

    doc = await tUser({
      fromUserId: user.id,
      toAccountId: accountId,
      amount: 100
    })
    expect(doc).toBeTruthy()
  })

  test('transfer error', async () => {
    try {
      await tUser({
        amount: 100
      })
    } catch (e) {
      expect(e).toBeTruthy()
    }

    try {
      await tUser({
        fromUserId: user.id,
        toUserId: user.id,
        amount: 100
      })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })
})
