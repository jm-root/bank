/**
 * 用户
 * 注: 用户数据由外部引入,并同步更新
 * @param {Object} sequelize
 * @param {Object} DataTypes
 * @return {Model}
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user', {
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
}
