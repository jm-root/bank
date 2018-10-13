const $ = require('./service')

let userId = 'testUserId'
let ctCode = 'cny'
let ctName = '人民币'

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
})

function log (doc) {
  console.log(doc)
}

describe('service', async () => {
  test('user', async () => {
    let doc = await service.user.get(userId)
    log(doc)
    expect(doc).toBeTruthy()
  })

  test('ct', async () => {
    let doc = await service.ct
      .find({
        where: {code: ctCode}
      })
    if (!doc) {
      doc = await service.ct.create({
        code: ctCode,
        name: ctName
      })
    }
    expect(doc).toBeTruthy()
  })

  test('query', async () => {
    let doc = await service.query({
      userId: userId,
      ctCode: ctCode
    })
    expect(doc).toBeTruthy()
  })

  test('updateAmount', async () => {
    try {
      let doc = await service
        .updateAmount({
          accountId: 1,
          ctId: 1,
          amount: -1000
        })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('put', async () => {
    let doc = await service
      .put({
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
    expect(doc).toBeTruthy()
  })

  test('take', async () => {
    try {
      let doc = await service
        .take({
          accountId: 1,
          ctId: 1,
          amount: 2000
        })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('transfer', async () => {
    let doc = await service
      .trans({
        toAccountId: 1,
        ctId: 1,
        amount: 1000,
        memo: 'test',
        payId: '134'
      })
    expect(doc).toBeTruthy()
  })

  test('transfer by user', async () => {
    let doc = await service
      .transByUser({
        toUserId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })
    expect(doc).toBeTruthy()
  })

  test('lock', async () => {
    let doc = await service
      .lock({
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
    expect(doc).toBeTruthy()
  })

  test('unlock', async () => {
    let doc = await service
      .unlock({
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
    expect(doc).toBeTruthy()
  })

  test('lock all', async () => {
    let doc = await service
      .lock({
        accountId: 1,
        ctId: 1,
        allAmount: 1
      })
    expect(doc).toBeTruthy()
  })

  test('unlock all', async () => {
    let doc = await service
      .unlock({
        accountId: 1,
        ctId: 1,
        allAmount: 1
      })
    expect(doc).toBeTruthy()
  })

  test('lock self', async () => {
    try {
      let doc = await service
        .lock({
          fromUserId: userId,
          accountId: 1,
          ctId: 1,
          amount: 1000
        })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })

  test('unlock self', async () => {
    try {
      let doc = await service
        .unlock({
          fromUserId: userId,
          accountId: 1,
          ctId: 1,
          amount: 1000
        })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })
})
