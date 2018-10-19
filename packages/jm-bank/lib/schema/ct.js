module.exports = function (sequelize, DataTypes) {
  return sequelize.define('ct',
    {
      code: {
        type: DataTypes.STRING(32),
        unique: true,
        allowNull: false,
        comment: '唯一编码',
        set: function (val) {
          this.setDataValue('code', val.toLowerCase())
        }
      },
      name: {type: DataTypes.STRING(32), unique: true, allowNull: false, comment: '唯一名称'},
      status: {type: DataTypes.INTEGER, defaultValue: 1, validate: {min: 0, max: 1}, comment: '状态 0:无效 1:有效'}
    },
    {
      tableName: 'ct',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      paranoid: true,
      comment: '币种表, 1个账号对应多个币种'
    })
}
