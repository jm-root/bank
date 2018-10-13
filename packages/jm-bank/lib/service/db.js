const Sequelize = require('sequelize')
const cls = require('cls-hooked')
let namespace = cls.createNamespace('bank-namespace')
Sequelize.useCLS(namespace)
const Op = Sequelize.Op
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
}

module.exports = function (opts = {}) {
  if (!opts.db) throw new Error('invalid config: db')
  let o = {
    operatorsAliases,
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
  return new Sequelize(opts.db, o)
}
