/**
 * 账户币种持有量
 * 注: 一个账户对应多个币种持有量
 * @param {Object} sequelize
 * @param {Object} DataTypes
 * @return {Model}
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('balance', {
    accountId: {type: DataTypes.INTEGER, unique: 'compositeIndex'}, // 账户id
    ctId: {type: DataTypes.INTEGER, unique: 'compositeIndex'}, // 币种id
    overdraw: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false}, // 允许透支额度,例如允许透支100, amount允许>=-100
    amount: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false}, // 持有量
    amountLocked: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false}, // 冻结数量
    amountValid: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      allowNull: false,
      get: function () {
        let overdraw = this.getDataValue('overdraw')
        let amount = this.getDataValue('amount')
        let amountLocked = this.getDataValue('amountLocked')
        let val = Number(overdraw) + Number(amount) - Number(amountLocked)
        return val
      }
    }
  }, {
    tableName: 'balance',
    createdAt: 'crtime',
    updatedAt: 'moditime',
    deletedAt: 'delTime'
  })
}
