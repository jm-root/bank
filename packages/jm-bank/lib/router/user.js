const error = require('jm-err')
const MS = require('jm-ms-core')
const consts = require('../consts')

let Err = error.Err
let ms = new MS()

module.exports = function (service, opts) {
  let dao = service.user
  let router = ms.router()

  let done = function (opts, cb) {
    let err = opts.err
    let doc = opts.doc
    cb(err, doc || Err.FA_INTERNALERROR)
  }

  let t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }

  let list = function (opts, cb, next) {
    dao.emit('before_list', opts, cb)
    let optsList = {}
    opts || (opts = {})
    opts.data || (opts.data = {})
    let page = opts.data.page
    let rows = opts.data.rows
    let conditions = opts.conditions || optsList.conditions || null
    let include = opts.include || optsList.include || null
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
    let optsGet = {}
    let fields = opts.fields || optsGet.fields || null
    dao.findById(
      id,
      {
        attributes: fields
      }
    ).then(function (result) {
      if (!result) {
        result = t(consts.Err.FA_INVALID_USER, opts.lng)
        opts.err = error.err(result)
      }
      opts.doc = result
      !opts.err && (dao.emit('get', opts, cb))
      next()
    }).catch(function (err) {
      console.error(err.stack)
      opts.err = err
      next()
    })
  }

  let post = function (opts, cb, next) {
    dao.emit('before_post', opts, cb)
    let id = opts.params.id
    return dao.update(
      opts.data,
      {
        where: {
          id: id
        }
      }
    )
      .then(function (result) {
        opts.doc = {ret: result[0]}
        dao.emit('post', opts, cb)
        next()
      }).catch(function (err) {
        console.error(err.stack)
        opts.err = err
        next()
      })
  }

  router
    .add('/', 'get', function (opts, cb, next) {
      opts.fields || (opts.fields = ['id', 'uid', 'accountId', 'safeAccountId', 'name', 'status'])
      let data = opts.data
      opts.conditions || (opts.conditions = {})
      if (data.userId) {
        opts.conditions.id = data.userId
      }
      next()
    })
    .add('/', 'get', list, done)

    .add('/:id', 'get', function (opts, cb, next) {
      opts.fields || (opts.fields = ['id', 'uid', 'accountId', 'safeAccountId', 'name', 'status'])
      next()
    })
    .add('/:id', 'get', get, done)
    .add('/:id', 'post', post, done)

  return router
}
