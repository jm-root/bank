const _ = require('lodash')
const log = require('jm-log4js')
const event = require('jm-event')
const error = require('jm-err')
const fs = require('fs')
const path = require('path')
const DB = require('./db')
const DAO = require('./dao')
const Associations = require('./associations')
const t = require('../locale')
const consts = require('../consts')

const Err = consts.Err
const logger = log.getLogger('bank')

/**
 * Class representing a bank.
 */
class Bank {
  /**
   * Create a bank.
   * @param {Object} opts
   * @example
   * opts参数:{
     *  db: (可选，默认'mysql://127.0.0.1/bank')
     * }
   */
  constructor (opts = {}) {
    event.enableEvent(this)
    this.logger = logger
    this.t = t
    this.ready = false
    this.db = DB(opts)
    let db = this.db

    // 批量引入model
    let dir = path.join(__dirname, '/../schema')
    fs
      .readdirSync(dir)
      .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
      })
      .forEach(file => {
        let model = db.import(path.join(dir, file))
        model.service = this
        DAO(model)
        this[model.name] = model
      })

    Associations(this)

    db
      .sync()
      .then(() => {
        this.ready = true
        this.emit('ready')
      })
  }

  onReady () {
    let self = this
    return new Promise(function (resolve, reject) {
      if (self.ready) return resolve(self.ready)
      self.once('ready', function () {
        resolve()
      })
    })
  }

}

module.exports = Bank
