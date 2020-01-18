const Sequelize = require('sequelize')
const cls = require('cls-hooked')
let namespace = cls.createNamespace('default-namespace')
Sequelize.useCLS(namespace)

module.exports = function (opts = {}) {
  const { db } = opts
  if (!db) throw new Error('invalid config: mysql')
  let o = {
    pool: {
      max: 100,
      min: 0,
      idle: 30000
    },
    dialectOptions: {
      supportBigNumbers: true
    },
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci'
      }
    }
  }
  if (!opts.debug) {
    o.logging = false
  } else {
    o.benchmark = true
  }
  return new Sequelize(db, o)
}
