const log = require('jm-log4js')
const { EventEmitter } = require('jm-event')
const fs = require('fs')
const path = require('path')
const DAO = require('./dao')
const Associations = require('./associations')
const t = require('../locale')

const logger = log.getLogger('bank')

/**
 * Class representing a bank.
 */
class Bank extends EventEmitter {
  /**
   * Create a bank.
   * @param {Object} opts
   * @example
   * opts参数:{
     *  db: (可选，默认'mysql://127.0.0.1/bank')
     * }
   */
  constructor (opts = {}) {
    super({ async: true })
    this.onReady()

    this.logger = logger
    this.t = t
    this.ready = false
    this.db = require('./mysql')(opts)
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

  async onReady () {
    if (this.ready) return
    return new Promise(resolve => {
      this.once('ready', () => {
        this.ready = true
        resolve()
      })
    })
  }
}

module.exports = Bank
