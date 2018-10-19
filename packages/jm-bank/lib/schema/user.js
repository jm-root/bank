const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err

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
      paranoid: true,
      comment: '用户'
    })

  // 创建用户时，自动创建一个默认账户和一个保险账户
  model.afterCreate(async (user, {transaction}) => {
    const {service} = model
    const data = {userId: user.id}

    let doc = await service.account.create(data, {transaction})
    const defaultAccountId = doc.id

    doc = await service.account.create(data, {transaction})
    const safeAccountId = doc.id

    user.defaultAccountId = defaultAccountId
    user.safeAccountId = safeAccountId

    await model.update(
      {
        defaultAccountId,
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
        if (created) service.emit('user.create', data)
        return doc
      })
  }

  /**
   * 根据 id 获取用户的默认账户
   * @param id
   * @returns {Promise<*>}
   */
  model.getDefaultAccount = async function (id) {
    const doc = await this.get(id)
    return doc.getDefaultAccount()
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

  return model
}
