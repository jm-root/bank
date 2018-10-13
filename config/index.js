require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
const config = require('config')
if (config.disable_mq) delete config.modules['jm-bank-mq']
module.exports = config
