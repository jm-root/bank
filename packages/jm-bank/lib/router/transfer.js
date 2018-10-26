const jmss = require('jm-ms-sequlize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.transfer
  let router = ms.router()

  router
    .add('/', 'get', async (opts = {}) => {
      const {data = {}} = opts
      data.rows || (data.rows = 100)
    })
    .add('/', 'get', async opts => {
      const {data} = opts
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

      opts.order || (opts.order = [['crtime', 'DESC']])

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

      if (!opts.include) {
        opts.include = [
          {
            model: service.ct,
            as: 'ct',
            attributes: ['code', 'name']
          },
          {
            model: service.user,
            as: 'fromUser',
            attributes: ['id', 'name']
          },
          {
            model: service.user,
            as: 'toUser',
            attributes: ['id', 'name']
          }
        ]
      }
    })
    .use(jmss(model))

  return router
}
