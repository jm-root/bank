module.exports = function (service, opts = {}) {
  const {account, balance, ct, transfer, user} = service

  account.belongsTo(user)
  account.hasMany(balance)

  balance.belongsTo(ct)
  balance.belongsTo(account)

  transfer.belongsTo(balance, {as: 'fromBalance'})
  transfer.belongsTo(balance, {as: 'toBalance'})

  user.hasMany(account)
  user.belongsTo(account, {as: 'defaultAccount', constraints: false})
  user.belongsTo(account, {as: 'safeAccount', constraints: false})

}
