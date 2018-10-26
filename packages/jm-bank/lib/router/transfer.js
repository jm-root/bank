const jmss = require('jm-ms-sequlize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.transfer
  let router = ms.router()

  const fields = {exclude: ['fromUserId', 'toUserId']}
  router
    .add('/', 'get', async (opts = {}) => {
      const {data = {}} = opts
      data.rows || (data.rows = 100)
    })
    .add('/', 'get', async opts => {
      const {data = {}} = opts
      const {ctCode, userId, fromUserId, toUserId} = data
      let {ctId, accountId, fromAccountId, toAccountId} = data

      if (ctId || ctCode) {
        const doc = await service.ct.get({
          id: ctId,
          code: ctCode
        })
        ctId = doc.id
      }

      if (userId !== undefined) {
        if (!userId) {
          accountId = null
        } else {
          const doc = await service.user.get(userId)
          accountId = doc.accountId
        }
      }

      if (fromUserId !== undefined) {
        if (!fromUserId) {
          fromAccountId = null
        } else {
          const doc = await service.user.get(fromUserId)
          fromAccountId = doc.accountId
        }
      }

      if (toUserId !== undefined) {
        if (!toUserId) {
          toAccountId = null
        } else {
          const doc = await service.user.get(toUserId)
          toAccountId = doc.accountId
        }
      }

      opts.fields || (opts.fields = fields)

      opts.order || (opts.order = [['id', 'DESC']])

      opts.conditions || (opts.conditions = {})

      if (accountId !== undefined) {
        opts.conditions.$or = [
          {
            fromAccountId: accountId
          },
          {
            toAccountId: accountId
          }
        ]
      }

      if (fromAccountId !== undefined && !fromAccountId) fromAccountId = null
      if (toAccountId !== undefined && !toAccountId) toAccountId = null
      fromAccountId !== undefined && (opts.conditions.fromAccountId = fromAccountId)
      toAccountId !== undefined && (opts.conditions.toAccountId = toAccountId)
      ctId && (opts.conditions.ctId = ctId)
    })
    .use(jmss(model))

  model
    .on('list', async (opts, doc) => {
      if (doc && doc.rows) {
        for (const item of doc.rows) {
          const ct = await service.ct.get({id: item.ctId})
          item.ct = {code: ct.code, name: ct.name}
        }
      }
    })

  return router
}
