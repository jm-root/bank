const log = require('jm-log4js')
const fs = require('fs')
const path = require('path')
const DAO = require('./dao')
const Associations = require('./associations')
const t = require('../locale')

const logger = log.getLogger('bank')

const { Service } = require('jm-server')

module.exports = class extends Service {
  /**
   * Create a bank.
   * @param {Object} opts
   * @example
   * opts参数:{
     *  db: (可选，默认'mysql://127.0.0.1/bank')
     * }
   */
  constructor (opts = {}) {
    super(opts)

    this.logger = logger
    this.t = t
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
        this.emit('ready')
      })
  }

  router (opts) {
    const dir = `${__dirname}/../router`
    return this.loadRouter(dir, opts)
  }
}
