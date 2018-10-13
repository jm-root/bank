const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err

/**
 * 用户
 * 注: 用户数据由外部引入,并同步更新
 * @param {Object} sequelize
 * @param {Object} DataTypes
 * @return {Model}
 */
module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('user', {
    id: {type: DataTypes.STRING(32), primaryKey: true},
    uid: {type: DataTypes.INTEGER, unique: true}, // 关联外键, uid
    accountId: {type: DataTypes.INTEGER}, // 默认帐户id
    safeAccountId: {type: DataTypes.INTEGER}, // 保险帐户id
    name: {type: DataTypes.STRING}, // 用户名
    status: {type: DataTypes.INTEGER, defaultValue: 1} // 状态(0:无效,1:有效)
  }, {
    tableName: 'user',
    createdAt: 'crtime',
    updatedAt: 'moditime',
    deletedAt: 'delTime'
  })

  // 创建用户时，自动创建一个默认账户和一个保险账户
  model.afterCreate(async (user, opts) => {
    const {account} = model.service
    const {transaction} = opts
    const data = {userId: user.id}

    let doc = await account.create(data, {transaction})
    const accountId = doc.id

    doc = await account.create(data, {transaction})
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
    if (!id) {
      throw error.err(Err.FA_INVALID_USER)
    }
    const {service} = this
    await service.onReady()
    const data = {id}
    return this
      .findOrCreate({
        where: data,
        defaults: data
      })
      .spread((doc, created) => {
        if (created) service.emit('user.create', id)
        return doc
      })
  }

  /**
   * 根据 id 获取用户的默认账户
   * @param id
   * @returns {Promise<*>}
   */
  model.getDefaultAccount = async function (id) {
    const {service} = this
    const doc = await this.get(id)
    return service.account.findOne({
      where: {id: doc.accountId}
    })
  }

  /**
   * 根据 id 获取用户的保险账户
   * @param id
   * @returns {Promise<*>}
   */
  model.getSafeAccount = async function (id) {
    const {service} = this
    const doc = await this.get(id)
    return service.account.findOne({
      where: {id: doc.safeAccountId}
    })
  }

  return model
}
