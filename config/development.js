module.exports = {
  debug: true,
  port: 3000,
  db: 'mysql://root:123@localhost/bank',
  modules: {
    'jm-bank-mq': {
      config: {
        gateway: 'http://gateway.test.jamma.cn'
      }
    }
  }
}
