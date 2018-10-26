const {ObjectId} = require('bson')
const $ = require('./service')

function createId () {
  return new ObjectId().toString()
}

async function initCT () {
  const code = createId()
  return $.ct.create({
    code,
    name: code
  })
}

async function initUser () {
  const id = createId()
  return $.user.get(id)
}

async function transfer () {
  return $.user.transfer({
    ctCode: 'cny',
    toUserId: '000000000000000000000000',
    amount: 100
  })
}

async function init () {
  for (let i = 0; i < 100; i++) {
    // await initCT()
  }

  for (let i = 0; i < 100 * 10000; i++) {
    // await initUser()
  }

  for (let i = 0; i < 100 * 10000; i++) {
    await transfer()
  }

}

init()

