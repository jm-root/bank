require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
var config = {
  development: {
    port: 3000,
    lng: 'zh_CN',
    gateway: 'http://gateway.test.jamma.cn',
    db: 'mysql://root:123@localhost/bank',
    modules: {
      bank: {
        module: 'jm-bank',
        prefix: '/bank'
      },
      'jm-bank-mq': {}
    }
  },
  production: {
    port: 80,
    gateway: 'http://gateway.app',
    modules: {
      bank: {
        module: 'jm-bank',
        prefix: '/bank'
      },
      'jm-bank-mq': {}
    }
  }
}

var env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

if (process.env['disable_mq']) delete config.modules['jm-bank-mq']

module.exports = config
