const $ = require('./service')

let {user, ct} = require('./consts')

let service = null
let balance = null

beforeAll(async () => {
  await $.onReady()
  service = $.transfer
  ct = await $.ct.get(ct)
  user = await $.user.get(user.id)
  balance = await $.balance.get({accountId: user.accountId, ctId: ct.id})
})

describe('service.transfer', async () => {
  test('list', async () => {
    const doc = await service.find2({rows: 5})
    expect(doc).toBeTruthy()
  })

  test('to', async () => {
    const doc = await service.transfer({toBalanceId: balance.id, amount: 100, memo: '测试货币发行'})
    expect(doc.amount === 100).toBeTruthy()
  })

  test('from', async () => {
    const doc = await service.transfer({fromBalanceId: balance.id, amount: 100, memo: '测试货币回收'})
    expect(doc.amount === 100).toBeTruthy()
  })

})
