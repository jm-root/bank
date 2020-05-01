const { ms } = require('jm-server')

module.exports = async function ({ gateway }) {
  const client = await ms.client({ uri: gateway })

  /**
   * 建立服务访问绑定
   * @param {string} name 服务名
   * @param {string} uri 访问路径
   * @returns {Promise<*>} -
   */
  client.bind = async function (name, uri) {
    uri || (uri = `/${name}`)
    uri.indexOf('://') === -1 && (uri = gateway + uri)
    const doc = await ms.client({ uri })
    this[name] = doc
    return doc
  }

  return client
}
