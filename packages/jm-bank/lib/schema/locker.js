const error = require('jm-err')
const log = require('jm-log4js')
const consts = require('../consts')
const Err = consts.Err
const logger = log.getLogger('bank')

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('locker',
    {
      amount: {type: DataTypes.BIGINT, allowNull: false, validate: {min: 0}, comment: '冻结数量'},
      memo: {type: DataTypes.STRING, comment: '备注'}
    },
    {
      tableName: 'locker',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      comment: '冻结锁',
      indexes: [
        {
          unique: true,
          fields: ['userId', 'balanceId']
        }
      ]
    })

  /**
   *
   * 根据 balanceId 和 userId 获取冻结锁，没有就创建
   *
   * @param balanceId
   * @param userId
   * @returns {Promise<*>}
   */
  model.get = async function (balanceId, userId = null) {

    if (!balanceId) {
      throw error.err(Err.FA_INVALID_BALANCE)
    }

    const data = {
      balanceId
    }

    userId && (data.userId = userId)

    return this
      .findOrCreate({
        where: data,
        defaults: data
      })
      .spread(doc => {
        return doc
      })
  }

  /**
   *
   * 冻结指定数量的货币，amount 累加
   *
   * @param userId
   * @param balanceId
   * @param amount
   * @returns {Promise<*>}
   * @example
   * 成功返回:{
   *   locker: 冻结锁对象
   *   balance: 余额对象
   * }
   */
  model.lock = async function ({balanceId, userId, amount = 0}) {
    const {service} = this

    if (isNaN(amount) || amount < 0) throw error.err(Err.FA_INVALID_AMOUNT)

    const balance = await service.balance.findById(balanceId)
    if (!balance) throw error.err(Err.FA_INVALID_BALANCE)

    const account = await balance.getAccount()
    if (account.userId === userId) throw error.err(Err.FA_SELF_LOCK)

    const {amountValid} = balance

    if (amountValid < amount) throw error.err(Err.FA_OUTOF_BALANCE)

    const locker = await this.get(balanceId, userId)

    if (amount) {
      await balance.increment({amountLocked: amount})
      await balance.reload()
      await locker.increment({amount})
      await locker.reload()
    }

    const doc = {
      balanceId,
      userId,
      amount,
      totalAmount: locker.amount
    }
    service.emit('bank.lock', doc)
    logger.info('lock', doc)

    return {
      locker,
      balance
    }
  }

  model.lockAll = async function ({balanceId, userId}) {
    const {service} = this

    const balance = await service.balance.findById(balanceId)
    if (!balance) throw error.err(Err.FA_INVALID_BALANCE)

    const {amountValid} = balance
    if (amountValid < 0) throw error.err(Err.FA_OUTOF_BALANCE)

    return this.lock({balanceId, userId, amount: amountValid})
  }

  /**
   *
   * 解锁指定数量的货币，amount 累减
   *
   * @param userId
   * @param balanceId
   * @param amount
   * @returns {Promise<*>}
   * @example
   * 成功返回:{
   *   locker: 冻结锁对象
   *   balance: 余额对象
   * }
   */
  model.unlock = async function ({balanceId, userId, amount = 0}) {
    const {service} = this

    if (isNaN(amount) || amount < 0) throw error.err(Err.FA_INVALID_AMOUNT)

    const balance = await service.balance.findById(balanceId)
    if (!balance) throw error.err(Err.FA_INVALID_BALANCE)

    const account = await balance.getAccount()
    if (account.userId === userId) throw error.err(Err.FA_SELF_UNLOCK)

    const locker = await this.get(balanceId, userId)
    if (locker.amount < amount) amount = locker.amount

    if (amount) {
      await balance.decrement({amountLocked: amount})
      await balance.reload()
      await locker.decrement({amount})
      await locker.reload()
    }

    const doc = {
      balanceId,
      userId,
      amount,
      totalAmount: locker.amount
    }
    service.emit('bank.unlock', doc)
    logger.info('lock', doc)

    return {
      locker,
      balance
    }
  }

  model.unlockAll = async function ({balanceId, userId}) {
    const {service} = this

    const balance = await service.balance.findById(balanceId)
    if (!balance) throw error.err(Err.FA_INVALID_BALANCE)

    const locker = await this.get(balanceId, userId)

    return this.unlock({balanceId, userId, amount: locker.amount})
  }

  return model
}
