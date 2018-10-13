const Service = require('./service')
const router = require('./router')

module.exports = function (opts = {}) {
  let o = new Service(opts)
  o.router = router
  return o
}
