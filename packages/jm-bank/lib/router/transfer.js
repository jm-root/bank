const error = require('jm-err')
const MS = require('jm-ms-core')

let Err = error.Err
let ms = new MS()

module.exports = function (service, opts) {
  let dao = service.transfer
  let router = ms.router()

  let done = function (opts, cb) {
    let err = opts.err
    let doc = opts.doc
    cb(err, doc || Err.FA_INTERNALERROR)
  }

  let list = function (opts, cb, next) {
    dao.emit('before_list', opts, cb)
    // let optsList = _.cloneDeep(routes.opts.list);
    let optsList = {}
    opts || (opts = {})
    opts.data || (opts.data = {})
    let page = opts.data.page
    let rows = opts.data.rows
    let conditions = opts.conditions || optsList.conditions || null
    let include = opts.include || optsList.include || [
      {
        model: service.ct,
        attributes: ['code', 'name']
      },
      {
        model: service.account,
        as: 'fromAccount',
        attributes: ['userId', 'name'],
        include: [{model: service.user, attributes: ['id', 'uid', 'name']}]
      },
      {
        model: service.account,
        as: 'toAccount',
        attributes: ['userId', 'name'],
        include: [{model: service.user, attributes: ['id', 'uid', 'name']}]
      }
    ]
    let order = opts.order || optsList.order || null
    let fields = opts.fields || optsList.fields || null

    dao.find2({
      conditions: conditions,
      include: include,
      fields: fields,
      order: order,
      page: page,
      rows: rows
    }).then(function (result) {
      if (page || rows) {
        let doc = result.rows
        let total = result.count
        let pages = Math.ceil(total / rows)
        opts.doc = {
          page: page,
          pages: pages,
          total: total,
          rows: doc
        }
      } else {
        opts.doc = {rows: result}
      }
      dao.emit('list', opts, cb)
      next()
    }).catch(function (err) {
      console.error(err.stack)
      opts.err = err
      next()
    })
  }

  let get = function (opts, cb, next) {
    dao.emit('before_get', opts, cb)
    let id = opts.params.id
    // let optsGet = _.cloneDeep(routes.opts.get);
    let optsGet = {}
    let fields = opts.fields || optsGet.fields || null
    dao.findById(
      id,
      {
        attributes: fields
      }
    ).then(function (result) {
      opts.doc = result
      dao.emit('get', opts, cb)
      next()
    }).catch(function (err) {
      console.error(err.stack)
      opts.err = err
      next()
    })
  }

  router
    .add('/', 'get', function (opts, cb, next) {
      if (opts.data.ctCode) {
        service.getCT({
          code: opts.data.ctCode
        }).then(function (doc) {
          doc && (opts.data.ctId = doc.id)
          next()
        })
        return
      }
      next()
    })
    .add('/', 'get', function (opts, cb, next) {
      if (opts.data.userId !== undefined) {
        if (!opts.data.userId) {
          opts.data.accountId = null
          return next()
        }
        service.getUser({
          userId: opts.data.userId
        }).then(function (doc) {
          opts.data.accountId = doc.accountId
          next()
        })
        return
      }
      next()
    })
    .add('/', 'get', function (opts, cb, next) {
      if (opts.data.fromUserId !== undefined) {
        if (!opts.data.fromUserId) {
          opts.data.fromAccountId = null
          return next()
        }
        service.getUser({
          userId: opts.data.fromUserId
        }).then(function (doc) {
          opts.data.fromAccountId = doc.accountId
          next()
        })
        return
      }
      next()
    })
    .add('/', 'get', function (opts, cb, next) {
      if (opts.data.toUserId !== undefined) {
        if (!opts.data.toUserId) {
          opts.data.toAccountId = null
          return next()
        }

        service.getUser({
          userId: opts.data.toUserId
        }).then(function (doc) {
          opts.data.toAccountId = doc.accountId
          next()
        })
        return
      }
      next()
    })
    .add('/', 'get', function (opts, cb, next) {
      opts.order || (opts.order = [['crtime', 'DESC']])
      // opts.fields || (opts.fields = ['id', 'fromAccountId', 'toAccountId', 'amount', 'fromAccountBalance', 'toAccountBalance', 'memo']);
      opts.conditions || (opts.conditions = {})
      if (opts.data.accountId !== undefined) {
        opts.conditions.$or = [
          {
            fromAccountId: opts.data.accountId
          },
          {
            toAccountId: opts.data.accountId
          }
        ]
      }

      if (opts.data.fromAccountId !== undefined && !opts.data.fromAccountId) opts.data.fromAccountId = null
      if (opts.data.toAccountId !== undefined && !opts.data.toAccountId) opts.data.toAccountId = null
      opts.data.fromAccountId !== undefined && (opts.conditions.fromAccountId = opts.data.fromAccountId)
      opts.data.toAccountId !== undefined && (opts.conditions.toAccountId = opts.data.toAccountId)
      opts.data.ctId && (opts.conditions.ctId = opts.data.ctId)
      next()
    })
    .add('/', 'get', list, done)

    .add('/:id', 'get', function (opts, cb, next) {
      // opts.fields || (opts.fields = ['id', 'fromAccountId', 'toAccountId', 'amount', 'fromAccountBalance', 'toAccountBalance', 'memo']);
      next()
    })
    .add('/:id', 'get', get, done)

  return router
}
