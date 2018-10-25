const _ = require('lodash')
const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('balance',
    {
      overdraw: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false,
        validate: {min: 0},
        comment: '允许透支额度,例如允许透支100, amount允许>=-100'
      },
      amount: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false, comment: '实际余额'},
      amountValid: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false,
        comment: '可用余额 = 透支额度 + 实际余额',
        get: function () {
          const overdraw = this.getDataValue('overdraw')
          const amount = this.getDataValue('amount')
          return overdraw + amount
        }
      }
    },
    {
      tableName: 'balance',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      paranoid: true,
      comment: '余额, 对应1个账户和1个币种',
      indexes: [
        {
          unique: true,
          fields: ['accountId', 'ctId']
        }
      ]
    })

  /**
   *
   * 根据 accountId 和 ctId 获取余额，没有就创建
   *
   * @param accountId
   * @param ctId
   * @returns {Promise<*>}
   */
  model.get = async function ({accountId, ctId}) {

    if (!accountId) {
      throw error.err(Err.FA_INVALID_ACCOUNT)
    }

    if (!ctId) {
      throw error.err(Err.FA_INVALID_CT)
    }

    const data = {
      accountId,
      ctId
    }

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
   * 更新余额
   * @param {Object} opts 配置参数
   * @example
   * opts参数:{
   *   id: balance id(必填)
   *   amount: 数量(必填)
   * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  model.updateAmount = async function ({id, amount = 0}) {
    const {service} = this

    if (!id) {
      throw error.err(Err.FA_INVALID_BALANCE)
    }

    if (!Number.isFinite(amount)) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }

    const balance = await this.findById(id)
    if (balance.amountValid + amount < 0) throw error.err(Err.FA_OUTOF_BALANCE)

    await balance.increment({amount})

    await balance.reload()

    if (balance.amountValid < 0) throw error.err(Err.FA_OUTOF_BALANCE)

    return balance
  }

  /**
   * 存款
   * @param {Object} opts 配置参数 -
   * @example
   * opts参数:{
   *   id: balance id(必填)
   *   amount: 数量(必填)
   * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  model.put = function ({id, amount = 0}) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }
    return this.updateAmount({id, amount})
  }

  /**
   * 取款
   * @param {Object} opts 配置参数 -
   * @example
   * opts参数:{
   *   id: balance id(必填)
   *   amount: 数量(必填)
   * }
   * @example
   * 成功返回: balance对象
   * @return {Promise}
   */
  model.take = function ({id, amount = 0}) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw error.err(Err.FA_INVALID_AMOUNT)
    }
    return this.updateAmount({id, amount: -amount})
  }

  return model
}
