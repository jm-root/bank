const jmss = require('jm-ms-sequelize')
const { ms } = require('jm-server')

module.exports = function (service) {
  const model = service.ct
  const router = ms.router()

  router
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'code', 'name'])
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'code', 'name'])
    })
    .use(jmss(model))

  return router
}
