module.exports = {
  db: 'db',
  service_name: 'service_name',
  modules: {
    'jm-bank-mq': {
      config: {
        gateway: 'gateway'
      }
    },
    'jm-server-jaeger': {
      config: {
        jaeger: 'jaeger'
      }
    }
  }
}
