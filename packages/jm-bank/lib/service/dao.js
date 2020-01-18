const event = require('jm-event')

module.exports = function (model) {
  event.enableEvent(model, {
    force: true,
    async: true
  })

  model.find2 = function (opts = {}) {
    const {
      conditions = {},
      fields = null,
      include = null,
      order = null
    } = opts

    const o = {
      where: conditions,
      include,
      order
    }

    fields && (o.attributes = fields)

    let { page, rows } = opts

    if (page || rows) {
      page = Number(page) || 1
      rows = Number(rows) || 10
      o.offset = (page - 1) * rows
      o.limit = rows
      return this.findAndCountAll(o)
    } else {
      return this.findAll(o)
    }
  }
}
