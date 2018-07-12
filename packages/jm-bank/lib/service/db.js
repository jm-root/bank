const Sequelize = require('sequelize')
const cls = require('continuation-local-storage')
let namespace = cls.createNamespace('bank-namespace')
Sequelize.useCLS(namespace)

module.exports = function (opts) {
  let o = {
    pool: {
      max: 10,
      min: 0,
      idle: 30000
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true
    }
  }
  if (!opts.debug) {
    o.logging = false
  } else {
    o.benchmark = true
  }
  return new Sequelize(opts.db, o)
}
