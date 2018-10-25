const $ = require('./service')

let {user, ct} = require('./consts')

let service = null
let balance = null

beforeAll(async () => {
  await $.onReady()
  service = $.account
  ct = await $.ct.get(ct)
  user = await $.user.get(user.id)
})

const amount = 200

describe('service.account', async () => {
  test('list', async () => {
    const doc = await service.find2({rows: 5})
    expect(doc).toBeTruthy()
  })

  test('to', async () => {
    const doc = await service.transfer({toAccountId: user.defaultAccountId, ctId: ct.id, amount, memo: '测试货币发行'})
    expect(doc.amount === amount).toBeTruthy()
  })

  test('from', async () => {
    const doc = await service.transfer({fromAccountId: user.defaultAccountId, ctId: ct.id, amount, memo: '测试货币回收'})
    expect(doc.amount === amount).toBeTruthy()
  })

})
