const helper = require('jm-ms-help')
const MS = require('jm-ms-core')
let ms = new MS()

module.exports = function (service) {
  let router = ms.router()
  router.add('/', 'get', function (opts) {
    opts.help || (opts.help = {})
    opts.help.status = 1
    if (!service.ready) opts.help.status = 0
  })
  helper.enableHelp(router, require('../../package.json'))
  return router
}
