const log = require('jm-log4js')
const logger = log.getLogger('bank-mq')
const { Service } = require('jm-server')

class $ extends Service {
  constructor (opts, app) {
    super(opts)
    const { gateway } = opts
    const { bank } = app.modules

    if (!gateway) {
      logger.warn('no gateway config. I will not work.')
      return
    }

    if (!bank) {
      logger.warn('no bank module found. I will not work.')
      return
    }

    require('./gateway')({ gateway }).then(doc => {
      doc.bind('mq')
      this.gateway = doc
      this.emit('ready')
    })

    const v = ['user.create', 'updateAmount', 'transfer']

    v.forEach(key => {
      bank.on(key, opts => {
        opts && (this.send(`bank.${key}`, opts))
      })
    })
  }

  async send (topic, message) {
    await this.onReady()
    const msg = `topic: ${topic} message: ${JSON.stringify(message)}`
    try {
      logger.debug(`send mq. ${msg}`)
      await this.gateway.mq.post(`/${topic}`, { message })
    } catch (e) {
      logger.error(`send mq fail. ${msg}`)
      logger.error(e)
    }
  }
}

module.exports = function (opts, app) {
  return new $(opts, app)
}
