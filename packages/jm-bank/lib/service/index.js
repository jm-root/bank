const event = require('jm-event')
const error = require('jm-err')
const t = require('../locale')
const consts = require('../consts')
const fs = require('fs')
const path = require('path')
const DB = require('./db')
const DAO = require('./dao')
const Associations = require('./associations')
const Promise = require('bluebird')
const log = require('jm-log4js')

let Err = consts.Err

/**
 * Class representing a bank.
 */
class Bank {
  /**
   * Create a bank.
   * @param {Object} opts
   * @example
   * opts参数:{
     *  db: (可选，默认'mysql://127.0.0.1/bank')
     *  tableNamePrefix: 表名前缀, (可选, 默认'')
     * }
   */
  constructor (opts = {}) {
    let self = this
    event.enableEvent(this)
    this.logger = log.getLogger('bank')
    this.t = t
    this.ready = false
    this.db = DB(opts)
    let db = this.db

    // 批量引入model
    let dir = path.join(__dirname, '/../schema')
    fs
      .readdirSync(dir)
      .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
      })
      .forEach(function (file) {
        let model = db.import(path.join(dir, file))
        DAO(model)
        self[model.name] = model
      })

    Associations(self)

    db
      .sync()
      .then(() => {
        self.ready = true
        self.emit('ready')
      })
  }

  onReady () {
    let self = this
    return new Promise(function (resolve, reject) {
      if (self.ready) return resolve(self.ready)
      self.on('ready', function () {
        resolve()
      })
    })
  }

  /**
   * 根据userId获取用户，如果不存在就自动创建
   * @param {Object} opts
   * @returns {Promise}
   */
  getUser (opts = {}) {
    let self = this
    if (!opts.userId) {
      throw error.err(Err.FA_INVALID_USER)
    }
    return self.user
      .findOrCreate({
        where: {id: opts.userId},
        defaults: {id: opts.userId}
      })
      .spread(function (user) {
        self.emit('user.create', user)
        return user
      })
  }

  /**
   * 根据userId获取用户的默认账户
   * @param {Object} opts
   * @returns {Promise}
   */
  getDefaultAccount (opts = {}) {
    let self = this
    return self.getUser(opts)
      .then(function (user) {
        return self.account.findOne({
          where: {id: user.accountId}
        })
      })
  }

  /**
   * 根据userId获取用户的保险账户
   * @param {Object} opts
   * @returns {Promise}
   */
  getSafeAccount (opts = {}) {
    let self = this
    return self.getUser(opts)
      .then(function (user) {
        return self.account.findOne({
          where: {id: user.safeAccountId}
        })
      })
  }

  /**
   * 获取货币
   * @param {Object} opts
   * @example
   * opts参数:{
   *   id: 货币id(可选, 二选一)
   *   code: 货币code(可选, 二选一)
   *   status: 状态(可选)
   * }
   * @returns {Promise}
   */
  getCT (opts = {}) {
    let self = this
    if (!opts.code && !opts.id) {
      throw error.err(Err.FA_INVALID_CT)
    }
    let conditions = {}
    opts.code && (conditions.code = opts.code)
    opts.id && (conditions.id = opts.id)
    opts.status && (conditions.status = opts.status)
    return self.ct
      .findOne({
        where: conditions
      })
  }

  /**
   * 获取并验证货币是否有效
   * @param {Object} opts
   * @example
   * opts参数:{
   *   id: 货币id(可选, 二选一)
   *   code: 货币code(可选, 二选一)
   * }
   * @returns {Promise}
   */
  validCT (opts = {}) {
    opts.status = 1
    return this
      .getCT(opts)
      .then(function (ct) {
        if (!ct) throw error.err(Err.FA_INVALID_CT)
        return ct
      })
  }

  /**
   * 根据accountId和ctId获取余额，没有就创建
   * @param {Object} opts
   * @returns {Promise}
   */
  getBalance (opts = {}) {
    let self = this
    if (!opts.accountId) {
      throw error.err(Err.FA_INVALID_ACCOUNT)
    }
    if (!opts.ctId) {
      throw error.err(Err.FA_INVALID_CT)
    }
    let conditions = {
      accountId: opts.accountId,
      ctId: opts.ctId
    }
    return self.balance.findOrCreate({
      where: conditions,
      defaults: conditions
    }).spread(function (balance) {
      return balance
    })
  }

  /**
   * 根据fromUserId和balanceId获取预授权锁，没有就创建
   * @param {Object} opts
   * @returns {Promise}
   */
  getLocker (opts = {}) {
    let self = this
    if (!opts.balanceId) {
      throw error.err(Err.FA_INVALID_BALANCE)
    }
    let conditions = {
      balanceId: opts.balanceId
    }
    opts.fromUserId && (conditions.fromUserId = opts.fromUserId)
    return self.locker.findOrCreate({
      where: conditions,
      defaults: conditions
    }).spread(function (locker) {
      return locker
    })
  }

  /**
   * 查询余额
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
     *   accountId: 账户id(必填 accountId, userId 二选一)
     *   userId: 用户id(必填 accountId, userId 二选一)
     *   ctId: 币种id(可选, 查全部)
     *   ctCode: 币种code(可选, 查全部)
     *   safe: 是否查安全账户(可选)
     * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  query (opts = {}) {
    let self = this
    let logger = this.logger
    let d = Date.now()
    logger.debug('query begin: %j', opts)
    if (!opts.userId && !opts.accountId) {
      throw error.err(Err.FA_INVALID_ACCOUNT)
    }
    let conditions = {}
    opts.accountId && (conditions.accountId = opts.accountId)
    opts.ctId && (conditions.ctId = opts.ctId)
    let p
    if (opts.accountId) {
      p = self.account.findById(conditions.accountId)
    } else if (opts.safe) {
      p = self.getSafeAccount({
        userId: opts.userId
      })
    } else {
      p = self.getDefaultAccount({
        userId: opts.userId
      })
    }
    return p
      .then(function (account) {
        if (!account) throw error.err(Err.FA_INVALID_ACCOUNT)
        conditions.accountId = account.id
        if (opts.ctCode) {
          return self.getCT({
            code: opts.ctCode
          })
        }
        return null
      })
      .then(function (ct) {
        if (opts.ctCode) {
          if (ct) {
            conditions.ctId = ct.id
          } else {
            throw error.err(Err.FA_INVALID_CT)
          }
        }
        return self.balance.findAll({
          where: conditions,
          include: [
            {model: self.ct, attributes: ['code', 'name']}
          ]
        })
      })
      .then(function (balances) {
        let o = {}
        balances.forEach(function (balance) {
          o[balance.ct.code] = {
            overdraw: Number(balance.overdraw || 0),
            amount: Number(balance.amount || 0),
            amountLocked: Number(balance.amountLocked || 0),
            amountValid: Number(balance.amountValid || 0)
          }
        })
        logger.debug('query end (time: %j) ', Date.now() - d)
        logger.info('query: %j ', o)
        return o
      })
  }

  /**
   * 更新币种数量
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
     *   accountId: 账户id(必填)
     *   ctId: 币种id
     *   amount: 数量(必填)
     * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  updateAmount (opts = {}) {
    let self = this
    let logger = this.logger
    let d = Date.now()
    logger.debug('updateAmount begin: %j', opts)

    if (!opts.accountId) {
      throw error.err(Err.FA_INVALID_ACCOUNT)
    }

    if (!opts.ctId) {
      throw error.err(Err.FA_INVALID_CT)
    }

    if (!opts.amount) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }

    let userId
    return self.account.findOne({
      where: {id: opts.accountId}
    })
      .then(function (account) {
        if (!account) throw error.err(Err.FA_INVALID_ACCOUNT)
        if (account.status === 0) throw error.err(Err.FA_ACCOUNT_LOCKED)
        if (account.status === 2) throw error.err(Err.FA_ACCOUNT_CANCELED)
        userId = account.userId
        return account
      })
      .then(function (account) {
        return self.ct.findOne({
          where: {id: opts.ctId}
        })
      })
      .then(function (ct) {
        if (!ct) throw error.err(Err.FA_INVALID_CT)
        return self.getBalance(
          {accountId: opts.accountId, ctId: opts.ctId})
      })
      .then(function (balance) {
        let val = Number(balance.amountValid) + Number(opts.amount)
        if (val < 0) throw error.err(Err.FA_OUTOF_BALANCE)

        return balance.increment(
          {
            amount: opts.amount
          }
        )
      })
      .then(function (balance) {
        return balance.reload()
      })
      .then(function (balance) {
        if (Number(balance.amountValid) < 0) throw error.err(Err.FA_OUTOF_BALANCE)
        logger.debug('updateAmount end (time: %j) ', Date.now() - d)
        logger.debug('updateAmount: %j ', balance)
        self.emit('updateAmount', {
          userId: userId,
          accountId: opts.accountId,
          ctId: opts.ctId,
          amount: opts.amount
        })
        return balance
      })
  }

  /**
   * 存款
   * @param {Object} opts 配置参数 -
   * @example
   * opts参数:{
     *   accountId: 账户id
     *   ctId: 币种id
     *   amount: 数量(必填)
     * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  put (opts = {}) {
    let logger = this.logger
    logger.debug('put: %j', opts)
    if (isNaN(opts.amount) || opts.amount <= 0) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }
    return this.updateAmount(opts)
  }

  /**
   * 取款
   * @function bank#take
   * @param {Object} opts 配置参数 -
   * @example
   * opts参数:{
     *   accountId: 账户id
     *   ctId: 币种id
     *   amount: 数量(必填)
     * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  take (opts = {}) {
    let logger = this.logger
    logger.debug('take: %j', opts)
    if (isNaN(opts.amount) || opts.amount <= 0) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }
    opts.amount = -opts.amount
    return this.updateAmount(opts)
  }

  /**
   * 转账
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
     *   fromAccountId: 转出账户(可选，如果不填，默认系统),
     *   toAccountId: 转入账户(可选，如果不填，默认系统),
     *   ctId: 转出币种编码(必填)
     *   amount: 转出数量(必填)
     *   allAmount: 转出所有数量(可选，默认0)
     * }
   * @example
   * 成功返回: transfer对象
   * @return {Promise}
   */
  trans (opts = {}) {
    let self = this
    let logger = this.logger
    logger.info('transfer begin: %j', opts)
    let d = Date.now()
    if (!opts.fromAccountId && !opts.toAccountId) {
      throw error.err(Err.FA_INVALID_ACCOUNT)
    }

    if (opts.fromAccountId === opts.toAccountId) {
      throw error.err(Err.FA_SELF_TRANSFER)
    }

    if (!opts.allAmount && !opts.amount) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }

    return this
      .validCT({id: opts.ctId, code: opts.ctCode})
      .then(function (ct) {
        !opts.ctId && (opts.ctId = ct.id)
        if (opts.fromAccountId && opts.allAmount) {
          return self
            .getBalance({
              accountId: opts.fromAccountId, ctId: opts.ctId
            })
            .then(function (balance) {
              opts.amount = balance.amountValid
              return balance
            })
        } else {
          return null
        }
      })
      .then(function () {
        if (opts.fromAccountId) {
          return self.take({
            accountId: opts.fromAccountId,
            amount: opts.amount,
            ctId: opts.ctId
          })
        }
        return null
      })
      .then(function (balance) {
        balance && (opts.fromAccountBalance = balance.amount)
        if (opts.toAccountId) {
          return self.put({
            accountId: opts.toAccountId,
            amount: opts.amount,
            ctId: opts.ctId
          })
        }
        return null
      })
      .then(function (balance) {
        balance && (opts.toAccountBalance = balance.amount)
        return self.transfer.create(opts)
      })
      .then(function (transfer) {
        logger.debug('transfer end (time: %j) ', Date.now() - d)
        logger.info('transfer %j', transfer)
        return transfer
      })
  }

  /**
   * 用户间转账
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
     *   fromUserId: 转出账户(可选，如果不填，默认系统),
     *   toUserId: 转入账户(可选，如果不填，默认系统),
     *   ctCode: 转出币种编码(必填)
     *   amount: 转出数量(必填)
     *   allAmount: 转出所有数量(可选，默认0)
     * }
   * @example
   * 成功返回: transfer对象
   * @return {Promise}
   */
  transByUser (opts = {}) {
    let self = this
    let logger = this.logger
    logger.info('transferByUser begin: %j', opts)

    if (!opts.fromUserId && !opts.toUserId) {
      throw error.err(Err.FA_INVALID_USER)
    }

    if (opts.fromUserId === opts.toUserId) {
      throw error.err(Err.FA_SELF_TRANSFER)
    }

    return self
      .validCT({
        id: opts.ctId,
        code: opts.ctCode
      })
      .then(function (ct) {
        opts.ctId = ct.id

        if (opts.fromUserId) {
          return self.getUser({
            userId: opts.fromUserId
          })
        }
        return null
      })
      .then(function (user) {
        if (opts.fromUserId && !user) {
          throw error.err(Err.FA_INVALID_USER)
        }
        if (user) {
          opts.fromAccountId = user.accountId
        }
        if (opts.toUserId) {
          return self.getUser({
            userId: opts.toUserId
          })
        }
        return null
      })
      .then(function (user) {
        if (opts.toUserId && !user) {
          throw error.err(Err.FA_INVALID_USER)
        }
        if (user) {
          opts.toAccountId = user.accountId
        }
        return self.trans(opts)
      })
  }

  /**
   * 预授权，锁定指定数量的货币，amount累加
   * @param {Object} opts 配置参数 -
   * @example
   * opts参数:{
     *   fromUserId: 预授权用户Id(可选)
     *   accountId: 被授权账户id
     *   ctId: 币种id(ct二选一)
     *   amount: 数量(必填)
     *   allAmount: 是否全部数量(可选,默认:false)
     * }
   * @example
   * 成功返回:{
     *   locker: 预授权对象
     *   balance: 余额对象
     * }
   */
  lock (opts = {}) {
    let self = this
    let logger = this.logger

    if (opts.amount) {
      if (isNaN(opts.amount)) {
        throw error.err(Err.FA_INVALID_AMOUNT)
      }
      if (opts.amount < 0) {
        throw error.err(Err.FA_INVALID_AMOUNT)
      }
    }

    return self
      .validCT({id: opts.ctId})
      .then(function (ct) {
        if (opts.fromUserId && opts.accountId) {
          return self
            .account.findOne({
              where: {id: opts.accountId}
            })
            .then(function (account) {
              if (opts.fromUserId === account.userId) throw error.err(Err.FA_SELF_UNLOCK)
              return ct
            })
        }
        return ct
      })
      .then(function (ct) {
        return self.getBalance(opts)
      })
      .then(function (balance) {
        if (!balance) throw error.err(Err.FA_OUTOF_BALANCE)
        let amountValid = Number(balance.amountValid)
        if (opts.allAmount) {
          opts.amount = amountValid
          if (opts.amount < 0) opts.amount = 0
        }
        if (amountValid < opts.amount) throw error.err(Err.FA_OUTOF_BALANCE)
        return balance.increment({amountLocked: opts.amount})
      })
      .then(function (balance) {
        return balance.reload()
      })
      .then(function (balance) {
        let conditions = {
          balanceId: balance.id
        }
        opts.fromUserId && (conditions.fromUserId = conditions)
        return self
          .getLocker(conditions)
          .then(function (locker) {
            return locker.increment({amount: opts.amount})
              .then(function (locker) {
                return locker.reload()
              })
              .then(function (locker) {
                return {balance: balance, locker: locker}
              })
          })
      })
      .then(function (info) {
        logger.info('lock %j', info)
        let obj = {
          fromUserId: opts.fromUserId,
          accountId: opts.accountId,
          ctId: opts.ctId,
          amount: opts.amount,
          totalAmount: Number(info.locker.amount)
        }
        self.emit('bank.lock', obj)
        return info
      })
  }

  /**
   * 预授权解除，解锁指定数量的货币
   * @param {Object} opts 配置参数 -
   * @example
   * opts参数:{
     *   fromUserId: 预授权用户Id(可选)
     *   accountId: 被授权账户id
     *   ctId: 币种id(ct二选一)
     *   amount: 数量(必填)
     *   allAmount: 是否全部数量(可选,默认:false)
     * }
   * @example
   * 成功返回:{
     *   locker: 预授权对象
     *   balance: 币种持有量对象
     * }
   */
  unlock (opts = {}) {
    let self = this
    let logger = this.logger

    if (opts.amount) {
      if (isNaN(opts.amount)) throw error.err(Err.FA_INVALID_AMOUNT)
      if (opts.amount < 0) throw error.err(Err.FA_INVALID_AMOUNT)
      opts.amount = Math.abs(opts.amount)
    }

    let _balance
    let _locker
    return self
      .validCT({id: opts.ctId})
      .then(function (ct) {
        if (opts.fromUserId && opts.accountId) {
          return self
            .account.findOne({
              where: {id: opts.accountId}
            })
            .then(function (account) {
              if (opts.fromUserId === account.userId) throw error.err(Err.FA_SELF_UNLOCK)
              return ct
            })
        }
        return ct
      })
      .then(function (ct) {
        return self.getBalance(opts)
      })
      .then(function (balance) {
        _balance = balance
        return self.getLocker(
          {balanceId: balance.id, fromUserId: opts.fromUserId}
        )
      })
      .then(function (locker) {
        _locker = locker
        let amount = Number(locker.amount)
        if (opts.allAmount) {
          opts.amount = amount
        } else {
          if (amount < opts.amount) opts.amount = amount
        }
        if (opts.amount === amount) { // 直接移除授权
          _locker = null
          return locker.destroy()
        } else {
          return locker
            .decrement({amount: opts.amount})
            .then(function (locker) {
              return locker.reload()
            })
        }
      })
      .then(function () {
        return _balance.decrement({amountLocked: opts.amount})
      })
      .then(function (balance) {
        return balance.reload()
      })
      .then(function (balance) {
        return {balance: balance, locker: _locker || {}}
      })
      .then(function (info) {
        logger.info('unlock %j', info)
        let obj = {
          fromUserId: opts.fromUserId,
          accountId: opts.accountId,
          ctId: opts.ctId,
          amount: opts.amount,
          totalAmount: Number(info.locker.amount || 0)
        }
        self.emit('bank.unlock', obj)
        return info
      })
  }
}

module.exports = Bank
