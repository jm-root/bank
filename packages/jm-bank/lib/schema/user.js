const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err
const log = require('jm-log4js')
const logger = log.getLogger('bank')

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('user',
    {
      id: {type: DataTypes.STRING(32), primaryKey: true},
      name: {type: DataTypes.STRING(32), comment: '用户名'},
      status: {type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1, validate: {min: 0, max: 1}, comment: '状态(0:无效,1:有效)'}
    },
    {
      tableName: 'user',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      // paranoid: true,
      comment: '用户'
    })

  // 创建用户时，自动创建一个默认账户和一个保险账户
  model.afterCreate(async (user, {transaction}) => {
    const {service} = model
    const data = {userId: user.id}

    let doc = await service.account.create(data, {transaction})
    const accountId = doc.id

    doc = await service.account.create(data, {transaction})
    const safeAccountId = doc.id

    user.accountId = accountId
    user.safeAccountId = safeAccountId

    await model.update(
      {
        accountId,
        safeAccountId
      },
      {
        where: {
          id: user.id
        },
        transaction
      }
    )
  })

  /**
   * 根据 id 获取用户，如果不存在就自动创建
   * @param id
   * @returns {Promise<*>}
   */
  model.get = async function (id) {
    const {service} = model
    if (!id) {
      throw error.err(Err.FA_INVALID_USER)
    }
    const data = {id}
    return this
      .findOrCreate({
        where: data,
        defaults: data
      })
      .spread((doc, created) => {
        if (created) service.emit('user.create', doc)
        return doc
      })
  }

  /**
   * 根据 id 获取用户的默认账户
   * @param id
   * @returns {Promise<*>}
   */
  model.getAccount = async function (id) {
    const doc = await this.get(id)
    return doc.getAccount()
  }

  /**
   * 根据 id 获取用户的保险账户
   * @param id
   * @returns {Promise<*>}
   */
  model.getSafeAccount = async function (id) {
    const doc = await this.get(id)
    return doc.getSafeAccount()
  }

  /**
   * 查询余额
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
   *   userId: 用户id(必填)
   *   ctId: 币种id(可选, 查全部)
   *   ctCode: 币种code(可选, 查全部)
   *   safe: 是否查安全账户(可选)
   * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  model.query = async function (opts = {}) {
    logger.debug(`user.query`, opts)
    const {service} = this
    const {userId, ctCode, ctId, safe} = opts

    if (!userId) {
      throw error.err(Err.FA_INVALID_USER)
    }

    const user = await this.get(userId)
    let accountId = user.accountId
    if (safe) accountId = user.safeAccountId

    let conditions = {accountId}
    if (ctId || ctCode) {
      const doc = await service.ct.get({id: ctId, code: ctCode})
      conditions.ctId = doc.id
    }

    const balances = await service.balance.findAll({
      where: conditions
    })
    const data = {}
    for (const balance of balances) {
      const ct = await service.ct.get({id: balance.ctId})
      data[ct.code] = {
        overdraw: balance.overdraw || 0,
        amount: balance.amount || 0,
        amountValid: balance.amountValid || 0
      }
    }
    return data
  }

  /**
   * 用户之间转账
   *
   * fromUserId 和 toUserId 至少一个
   *
   * ctId 和 ctCode 至少一个
   *
   * allAmount 只能是 0 和 1，(为 1 时 忽略amount)
   *
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
   *   fromUserId: 转出用户(不填则默认系统),
   *   toUserId: 转入用户(不填则默认系统),
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
    logger.info(`user.transfer`, opts)
    const {service} = this
    const {fromUserId = null, toUserId = null} = opts

    if (!fromUserId && !toUserId) throw error.err(Err.FA_INVALID_USER)

    const data = {...opts}

    if (fromUserId) {
      const doc = await this.get(fromUserId)
      data.fromAccountId = doc.accountId
    }

    if (toUserId) {
      const doc = await this.get(toUserId)
      data.toAccountId = doc.accountId
    }

    return await service.account.transfer(data)
  }

  return model
}
