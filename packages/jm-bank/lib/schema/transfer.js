const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err
const log = require('jm-log4js')
const logger = log.getLogger('bank')

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('transfer',
    {
      amount: {type: DataTypes.BIGINT, allowNull: false, validate: {min: 0}, comment: '转账数量'},
      fromAccountBalance: {type: DataTypes.BIGINT, comment: '转出账户的余额'},
      toAccountBalance: {type: DataTypes.BIGINT, comment: '转入账户的余额'},
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

  return model
}
