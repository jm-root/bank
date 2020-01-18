const $ = require('./service')

let { user, ct } = require('./consts')

let service = null
let balance = null

beforeAll(async () => {
  await $.onReady()
  service = $.balance
  ct = await $.ct.get(ct)
  user = await $.user.get(user.id)
  balance = await service.get({ accountId: user.accountId, ctId: ct.id })
})

describe('service.balance', async () => {
  test('list', async () => {
    const doc = await service.find2({ rows: 5 })
    expect(doc).toBeTruthy()
  })

  test('put', async () => {
    const amount = balance.amountValid
    balance = await service.put({ id: balance.id, amount: 100 })
    expect(balance.amountValid === amount + 100).toBeTruthy()
  })

  test('take', async () => {
    const amount = balance.amountValid
    balance = await service.take({ id: balance.id, amount: 100 })
    expect(balance.amountValid === amount - 100).toBeTruthy()
  })
})
