module.exports = function (sequelize, DataTypes) {
  return sequelize.define('balance',
    {
      overdraw: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false,
        validate: {min: 0},
        comment: '允许透支额度,例如允许透支100, amount允许>=-100'
      },
      amount: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false, comment: '实际余额'},
      amountLocked: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false, validate: {min: 0}, comment: '冻结数量'},
      amountValid: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false,
        comment: '可用余额 = 透支额度 + 实际余额 - 冻结数量',
        get: function () {
          const overdraw = this.getDataValue('overdraw')
          const amount = this.getDataValue('amount')
          const amountLocked = this.getDataValue('amountLocked')
          return overdraw + amount - amountLocked
        }
      }
    },
    {
      tableName: 'balance',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      paranoid: true,
      comment: '余额表, 对应1个账户和1个币种',
      indexes: [
        {
          unique: true,
          fields: ['accountId', 'ctId']
        }
      ]
    })
}
