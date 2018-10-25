const jmss = require('jm-ms-sequlize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.user
  let router = ms.router()

  router
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'defaultAccountId', 'safeAccountId', 'name', 'status'])
      let data = opts.data
      opts.conditions || (opts.conditions = {})
      if (data.userId) {
        opts.conditions.id = data.userId
      }
    })
    .add('/:id/query', 'get', opts => {
      return model.query({...opts.data, userId: opts.params.id})
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'defaultAccountId', 'safeAccountId', 'name', 'status'])
    })
    .use(jmss(model))

  return router
}
