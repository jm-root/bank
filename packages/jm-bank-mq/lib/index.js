const log = require('jm-log4js')
const logger = log.getLogger('bank')
const MS = require('jm-ms')

let ms = new MS()

module.exports = function (opts, app) {
  ['gateway'].forEach(function (key) {
    process.env[key] && (opts[key] = process.env[key])
  })

  let o = {
    ready: true,
    gateway: opts.gateway,

    onReady: function () {
      return this.ready
    },

    bind: async function (name, uri) {
      uri || (uri = `/${name}`)
      let doc = await ms.client({ uri: this.gateway + uri })
      this[name] = doc
      return doc
    }
  }

  if (!app.modules.bank) {
    logger.warn('no bank module found. so I can not work.')
    return o
  }
  if (!opts.gateway) {
    logger.warn('no gateway config. so I can not work.')
    return o
  }

  o.bind('mq')

  let bank = app.modules.bank

  let send = async function (topic, message) {
    return o.mq.post(`/${topic}`, { message })
      .catch(e => {
        logger.error(`send mq fail. topic: ${topic} message: ${JSON.stringify(message)}`)
        logger.error(e)
      })
  }

  bank.on('user.create', function (opts) {
    opts && (send('bank.user.create', opts))
  })
  bank.on('updateAmount', function (opts) {
    opts && (send('bank.updateAmount', opts))
  })
  bank.on('transfer', function (opts) {
    opts && (send('bank.transfer', opts))
  })
}
