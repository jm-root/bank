module.exports = function (service, opts = {}) {
  const {account, balance, ct, locker, transfer, user} = service

  account.belongsTo(user)
  account.hasMany(balance)

  balance.belongsTo(ct)
  balance.belongsTo(account)
  balance.hasMany(locker)

  transfer.belongsTo(balance, {as: 'fromBalance'})
  transfer.belongsTo(balance, {as: 'toBalance'})

  locker.belongsTo(balance)
  locker.belongsTo(user)

  user.hasMany(account)
  user.belongsTo(account, {as: 'defaultAccount', constraints: false})
  user.belongsTo(account, {as: 'safeAccount', constraints: false})

}
