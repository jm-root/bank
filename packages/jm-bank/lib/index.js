const Service = require('./service')

module.exports = function (opts = {}) {
  const app = this || {}
  return new Service({ app, ...opts })
}
