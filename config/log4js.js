module.exports = {
  appenders: {
    console: { type: 'console' },
    bank: {
      type: 'dateFile',
      filename: 'logs/bank',
      pattern: 'yyyyMMdd.log',
      alwaysIncludePattern: true
    }
  },
  categories: {
    default: { appenders: [ 'console' ], level: 'info' },
    bank: { appenders: [ 'console', 'bank' ], level: 'info' }
  }
}
