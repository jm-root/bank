require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
let config = {
  development: {
    debug: true,
    lng: 'zh_CN',
    port: 3000,
    db: 'mysql://root:123@api.test.jamma.cn/bank',
    modules: {
      bank: {
        module: process.cwd() + '/lib'
      }
    }
  },
  production: {
    port: 80,
    modules: {
      bank: {
        module: process.cwd() + '/lib'
      }
    }
  }
}

let env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

module.exports = config
