module.exports = function (service, opts = {}) {
  const { account, balance, ct, transfer, user } = service

  account.belongsTo(user)
  account.hasMany(balance)

  balance.belongsTo(ct)
  balance.belongsTo(account)

  transfer.belongsTo(account, { as: 'fromAccount' })
  transfer.belongsTo(account, { as: 'toAccount' })
  transfer.belongsTo(user, { as: 'fromUser' })
  transfer.belongsTo(user, { as: 'toUser' })
  transfer.belongsTo(ct)

  user.hasMany(account)
  user.belongsTo(account, { as: 'account', constraints: false })
  user.belongsTo(account, { as: 'safeAccount', constraints: false })
}
