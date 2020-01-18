const $ = require('./service')

const { id } = require('./consts').user
const { ct } = require('./consts')

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $.user
})

const amount = 300

describe('service.user', async () => {
  test('list', async () => {
    let doc = await service.find2({ rows: 5 })
    expect(doc).toBeTruthy()
  })

  test('get', async () => {
    let doc = await service.get(id)
    expect(doc.id === id).toBeTruthy()
    const account = await doc.getAccount()
    const safeAccount = await doc.getSafeAccount()
    await account.getUser()
    expect(account.userId === id && safeAccount.userId === id).toBeTruthy()
  })

  test('query', async () => {
    const doc = await service.query({ userId: id, ctCode: ct.code })
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('query safe', async () => {
    const doc = await service.query({ userId: id, ctCode: ct.code, safe: true })
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('to', async () => {
    const doc = await service.transfer({ toUserId: id, ctCode: ct.code, amount, memo: '测试货币发行' })
    expect(doc.amount === amount).toBeTruthy()
  })

  test('from', async () => {
    const doc = await service.transfer({ fromUserId: id, ctCode: ct.code, allAmount: 1, memo: '测试货币回收' })
    expect(doc.amount === amount).toBeTruthy()
  })
})
