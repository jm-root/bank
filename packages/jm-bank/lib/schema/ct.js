/**
 * 币种
 * 注:一账号对应多个币种,一个发行商可以发行多个币种
 * @param {Object} sequelize
 * @param {Object} DataTypes
 * @return {Model}
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('ct', {
    code: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
      set: function (val) {
        this.setDataValue('code', val.toLowerCase())
      }
    }, // 编码
    name: {type: DataTypes.STRING(32), unique: true, allowNull: false}, // 名称
    status: {type: DataTypes.INTEGER, defaultValue: 1} // 状态(0:无效,1:有效)
  }, {
    tableName: 'ct',
    createdAt: 'crtime',
    updatedAt: 'moditime',
    deletedAt: 'delTime'
  })
}
