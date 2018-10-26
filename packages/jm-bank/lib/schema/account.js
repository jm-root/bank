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
      comment: '账户, 1个用户对应多个账户',
      paranoid: true
    })

  /**
   * 账户之间转账
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
   *   fromAccountId: 转出账户(可选，如果不填，默认系统),
   *   toAccountId: 转入账户(可选，如果不填，默认系统),
   *   ctId: 币种Id(必填)
   *   amount: 转出数量(必填)
   * }
   * @example
   * 成功返回: transfer对象
   * @return {Promise}
   */
  model.transfer = async function (opts = {}) {
    logger.debug(`account.transfer`, opts)
    const {service} = this
    const {fromAccountId = null, toAccountId = null, ctId, amount = 0} = opts

    if (!fromAccountId && !toAccountId) throw error.err(Err.FA_INVALID_ACCOUNT)

    if (!ctId) throw error.err(Err.FA_INVALID_CT)

    if (!Number.isFinite(amount) || amount <= 0) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }

    await service.ct.get({id: ctId})

    const data = {...opts}

    let fromAccount = null
    let fromBalance = null
    let toAccount = null
    let toBalance = null
    if (fromAccountId) {
      fromAccount = await this.findById(fromAccountId)
      fromBalance = await service.balance.get({accountId: fromAccountId, ctId})
      data.fromUserId = fromAccount.userId
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

    return service.transfer.create(data)
  }

  return model
}
