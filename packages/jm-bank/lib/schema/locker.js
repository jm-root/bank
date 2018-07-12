/**
 * 货币锁
 * 注:
 * @param {Object} sequelize
 * @param {Object} DataTypes
 * @return {Model}
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('locker', {
    fromUserId: {type: DataTypes.STRING(32), unique: 'compositeIndex'}, // 预授权用户Id
    balanceId: {type: DataTypes.INTEGER, unique: 'compositeIndex'}, // 关联(balance)
    amount: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false}, // 预授权数量
    memo: {type: DataTypes.STRING} // 备注
  }, {
    tableName: 'locker',
    createdAt: 'crtime',
    updatedAt: 'moditime',
    deletedAt: 'delTime'
  })
}
