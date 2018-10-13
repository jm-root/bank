module.exports = function (service, opts = {}) {
  let self = service
  self.user.hasMany(self.account, {foreignKey: 'userId'})
  self.account.belongsTo(self.user, {foreignKey: 'userId'})
  self.account.hasMany(self.balance, {foreignKey: 'accountId'})
  self.balance.belongsTo(self.account, {foreignKey: 'accountId'})
  self.balance.belongsTo(self.ct, {foreignKey: 'ctId'})
  self.transfer.belongsTo(self.ct, {foreignKey: 'ctId'})
  self.transfer.belongsTo(self.account, {as: 'fromAccount', foreignKey: 'fromAccountId'})
  self.transfer.belongsTo(self.account, {as: 'toAccount', foreignKey: 'toAccountId'})
  self.balance.hasMany(self.locker, {foreignKey: 'balanceId'})
  self.locker.belongsTo(self.balance, {foreignKey: 'balanceId'})
  self.locker.belongsTo(self.user, {foreignKey: 'fromUserId'})
}
