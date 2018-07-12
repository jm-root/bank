const error = require('jm-err')
const MS = require('jm-ms-core')

let Err = error.Err
let ms = new MS()

module.exports = function (service, opts) {
  let dao = service.ct
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

  let post = function (opts, cb, next) {
    dao.create(
      opts.data
    ).then(function (result) {
      opts.doc = result
      dao.emit('post', opts, cb)
      next()
    }).catch(function (err) {
      console.error(err.stack)
      opts.err = err
      next()
    })
  }

  let put = function (opts, cb, next) {
    let id = opts.params.id
    dao.update(
      opts.data,
      {
        where: {id: id}
      }
    ).then(function (result) {
      opts.doc = {ret: result[0]}
      dao.emit('put', opts, cb)
      next()
    }).catch(function (err) {
      console.error(err.stack)
      opts.err = err
      next()
    })
  }

  let del = function (opts, cb, next) {
    let id = opts.data.id
    opts.params.id && (id = [opts.params.id])
    dao.destroy({
      where: {
        id: {$in: id}
      }
    }).then(function (result) {
      opts.doc = {ret: result}
      dao.emit('delete', opts, cb)
      next()
    }).catch(function (err) {
      console.error(err.stack)
      opts.err = err
      next()
    })
  }

  router
    .add('/', 'get', function (opts, cb, next) {
      opts.fields || (opts.fields = ['id', 'code', 'name', 'status'])
      next()
    })
    .add('/', 'get', list, done)

    .add('/:id', 'get', function (opts, cb, next) {
      opts.fields || (opts.fields = ['id', 'code', 'name', 'status'])
      next()
    })
    .add('/:id', 'get', get, done)
    .add('/:id', 'delete', del, done)
    .add('/', 'post', post, done)
    .add('/:id', 'post', put, done)
    .add('/', 'delete', del, done)
  return router
}
