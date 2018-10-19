module.exports = function (sequelize, DataTypes) {
  return sequelize.define('locker',
    {
      amount: {type: DataTypes.BIGINT, allowNull: false, validate: {min: 0}, comment: '预授权数量'},
      memo: {type: DataTypes.STRING, comment: '备注'}
    },
    {
      tableName: 'locker',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      paranoid: true,
      comment: '预授权',
      indexes: [
        {
          unique: true,
          fields: ['userId', 'balanceId']
        }
      ]
    })
}
