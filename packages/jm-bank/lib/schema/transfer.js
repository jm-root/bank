/**
 * 转帐
 * 注:
 * @param {Object} sequelize
 * @param {Object} DataTypes
 * @return {Model}
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('transfer', {
    ctId: {type: DataTypes.INTEGER}, // 币种,关联(ct)
    fromAccountId: {type: DataTypes.INTEGER}, // 转出账户
    toAccountId: {type: DataTypes.INTEGER}, // 转入账户
    amount: {type: DataTypes.BIGINT}, // 交易额
    fromAccountBalance: {type: DataTypes.BIGINT}, // 转出账户余额
    toAccountBalance: {type: DataTypes.BIGINT}, // 转出账户余额
    payId: {type: DataTypes.STRING(32)}, // 支付单号
    attach: {type: DataTypes.STRING}, // 附加信息
    orderId: {type: DataTypes.STRING(32)}, // 商户自编订单号
    memo: {type: DataTypes.STRING} // 备注信息
  }, {
    tableName: 'transfer',
    createdAt: 'crtime',
    updatedAt: false,
    deletedAt: 'delTime'
  })
}
