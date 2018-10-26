const {ObjectId} = require('bson')
const $ = require('./service')

/**
 * 升级 3.1.0 数据
 * @returns {Promise<void>}
 */
async function upgrade () {

  // 补充 transfer 表的 fromUserId toUserId
  let doc = await $.transfer.findAll()
  for (const item of doc) {
    let {id, fromUserId, toUserId, fromAccountId, toAccountId} = item
    if (fromUserId || toUserId) continue
    if (fromAccountId) {
      const doc = await $.account.findById(fromAccountId)
      item.fromUserId = doc.userId
    }
    if (toAccountId) {
      const doc = await $.account.findById(toAccountId)
      item.toUserId = doc.userId
    }
    console.log(id, item.fromUserId, item.toUserId)
    await item.save()
  }

}

upgrade()

