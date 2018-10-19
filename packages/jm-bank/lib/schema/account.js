const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('account',
    {
      password: {type: DataTypes.STRING(128), comment: '转帐密码'},
      salt: {type: DataTypes.STRING(128), comment: '转帐密钥'},
      name: {type: DataTypes.STRING(32), comment: '账户名称，用户自己可以修改'},
      status: {type: DataTypes.INTEGER, defaultValue: 1, validate: {min: 0, max: 2}, comment: '账号状态 0:冻结 1:正常 2:注销'}
    },
    {
      tableName: 'account',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      comment: '账户, 1个用户对应多个账户',
      paranoid: true
    })

  return model
}
