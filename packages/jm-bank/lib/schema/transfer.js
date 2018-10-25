const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err
const log = require('jm-log4js')
const logger = log.getLogger('bank')

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('transfer',
    {
      amount: {type: DataTypes.BIGINT, allowNull: false, validate: {min: 0}, comment: '转账数量'},
      fromBalanceAmount: {type: DataTypes.BIGINT, comment: '转出账户的余额'},
      toBalanceAmount: {type: DataTypes.BIGINT, comment: '转入账户的余额'},
      payId: {type: DataTypes.STRING(32), comment: '付款单号'},
      orderId: {type: DataTypes.STRING(32), comment: '商户自编订单号'},
      attach: {type: DataTypes.STRING, comment: '附加信息'},
      memo: {type: DataTypes.STRING, comment: '备注信息'}
    },
    {
      tableName: 'transfer',
      createdAt: 'crtime',
      updatedAt: false,
      deletedAt: 'deltime',
      paranoid: true,
      comment: '转账'
    })

  /**
   * 转账
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
   *   fromBalanceId: 转出账户(可选，如果不填，默认系统),
   *   toBalanceId: 转入账户(可选，如果不填，默认系统),
   *   amount: 转出数量(必填)
   * }
   * @example
   * 成功返回: transfer对象
   * @return {Promise}
   */
  model.transfer = async function (opts = {}) {
    logger.debug(`transfer.transfer`, opts)
    const {service} = this
    const {fromBalanceId = null, toBalanceId = null, amount = 0} = opts

    if (!fromBalanceId && !toBalanceId) {
      throw error.err(Err.FA_INVALID_BALANCE)
    }

    if (fromBalanceId === toBalanceId) {
      throw error.err(Err.FA_SELF_TRANSFER)
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }

    const data = {...opts}

    let fromBalance = null
    let toBalance = null

    if (fromBalanceId) {
      const doc = await service.balance.take({id: fromBalanceId, amount})
      data.fromBalanceAmount = doc.amount
      data.ctId = doc.ctId
      fromBalance = doc
      const account = await service.account.findById(doc.accountId)
      data.fromAccountId = doc.accountId
      data.fromUserId = account.userId
    }

    if (toBalanceId) {
      const doc = await service.balance.put({id: toBalanceId, amount})
      data.toBalanceAmount = doc.amount
      data.ctId = doc.ctId
      const account = await service.account.findById(doc.accountId)
      data.toAccountId = doc.accountId
      data.toUserId = account.userId
      toBalance = doc
    }

    if (fromBalance && toBalance && fromBalance.ctId !== toBalance.ctId) throw error.err(Err.FA_DIFFERENT_CT)

    return this.create(data)
  }

  return model
}
