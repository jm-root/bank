const log = require('jm-log4js')
const Service = require('./service')
const router = require('./router')
const logger = log.getLogger('bank')

module.exports = function (opts = {}) {
  if (opts.debug) {
    logger.setLevel('debug')
  }
  let o = new Service(opts)
  o.router = router
  return o
}
