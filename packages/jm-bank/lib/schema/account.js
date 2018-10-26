const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err
const log = require('jm-log4js')
const logger = log.getLogger('bank')

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('account',
    {
      password: {type: DataTypes.STRING(128), comment: '转帐密码'},
      salt: {type: DataTypes.STRING(128), comment: '转帐密钥'},
      name: {type: DataTypes.STRING(32), comment: '账户名称，用户自己可以修改'},
      status: {type: DataTypes.INTEGER, defaultValue: 1, validate: {min: 0, max: 2}, comment: '账号状态 0:冻结 1:正常 2:注销'}
    },
    {
      tableName: 'account',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      // paranoid: true,
      comment: '账户, 1个用户对应多个账户'
    })

  /**
   * 账户之间转账
   *
   * fromAccountId 和 toAccountId 至少一个
   *
   * ctId 和 ctCode 至少一个
   *
   * allAmount 只能是 0 和 1，(为 1 时 忽略amount)
   *
   * fromAccountId 为空时, 忽略 allAmount
   *
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
   *   fromAccountId: 转出账户(不填则默认系统),
   *   toAccountId: 转入账户(不填则默认系统),
   *   ctId: 币种Id
   *   ctCode: 币种编码
   *   amount: 转出数量
   *   allAmount: 是否转出所有数量
   * }
   * @example
   * 成功返回: transfer对象
   * @return {Promise}
   */
  model.transfer = async function (opts = {}) {
    logger.debug(`account.transfer`, opts)
    const {service} = this
    let {fromAccountId, toAccountId, ctId, ctCode, amount = 0, allAmount = 0} = opts

    if (!fromAccountId && !toAccountId) throw error.err(Err.FA_INVALID_ACCOUNT)

    if (fromAccountId === toAccountId) throw error.err(Err.FA_SELF_TRANSFER)

    if (!ctCode && !ctId) throw error.err(Err.FA_INVALID_CT)

    if (amount && (!Number.isFinite(amount) || amount <= 0)) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }

    if (allAmount !== 0 && allAmount !== 1) {
      throw error.err(Err.FA_INVALID_ALLAMOUNT)
    }

    const ct = await service.ct.get({code: ctCode, id: ctId})
    ctId = ct.id

    const data = {...opts, ctId}

    let fromAccount = null
    let fromBalance = null
    let toAccount = null
    let toBalance = null

    if (fromAccountId) {
      fromAccount = await this.findById(fromAccountId)
      fromBalance = await service.balance.get({accountId: fromAccountId, ctId})
      data.fromUserId = fromAccount.userId
    }

    if (allAmount) {
      if (!fromAccountId) throw error.err(Err.FA_OUTOF_BALANCE)
      amount = fromBalance.amountValid
      if (amount <= 0) {
        throw error.err(Err.FA_OUTOF_BALANCE)
      }
      data.amount = amount
    }

    if (toAccountId) {
      toAccount = await this.findById(toAccountId)
      toBalance = await service.balance.get({accountId: toAccountId, ctId})
      data.toUserId = toAccount.userId
    }

    if (fromBalance) {
      const doc = await service.balance.take({balance: fromBalance, amount})
      data.fromAccountBalance = doc.amount
    }

    if (toBalance) {
      const doc = await service.balance.put({balance: toBalance, amount})
      data.toAccountBalance = doc.amount
    }

    const doc = await service.transfer.create(data)

    const o = {
      ...data,
      ...doc.get({plain: true})
    }

    service.emit('transfer', o)

    return doc
  }

  return model
}
