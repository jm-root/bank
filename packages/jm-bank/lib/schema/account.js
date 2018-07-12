/**
 * 账户
 * 注: 一个用户对应多个账户
 * @param {Object} sequelize
 * @param {Object} DataTypes
 * @return {Model}
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('account', {
    password: {type: DataTypes.STRING(128)}, // 转帐密码
    salt: {type: DataTypes.STRING(128)}, // 转帐钥匙
    name: {type: DataTypes.STRING(32)}, // 账户名称，用户自己可以修改
    status: {type: DataTypes.INTEGER, defaultValue: 1} // 账号状态(0:冻结,1:正常,2:注销)
  }, {
    tableName: 'account',
    createdAt: 'crtime',
    updatedAt: 'moditime',
    deletedAt: 'delTime'
  })
}
