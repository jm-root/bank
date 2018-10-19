module.exports = function (sequelize, DataTypes) {
  return sequelize.define('locker',
    {
      amount: {type: DataTypes.BIGINT, allowNull: false, validate: {min: 0}, comment: '冻结数量'},
      memo: {type: DataTypes.STRING, comment: '备注'}
    },
    {
      tableName: 'locker',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      comment: '冻结表',
      indexes: [
        {
          unique: true,
          fields: ['userId', 'balanceId']
        }
      ]
    })
}
