const event = require('jm-event')

module.exports = function (model) {
  event.enableEvent(model)
  model.find2 = function (opts, cb) {
    let self = this
    opts || (opts = {})
    let conditions = opts.conditions || {}
    let fields = opts.fields || null
    let include = opts.include || null
    let order = opts.order || null
    let o = {
      where: conditions,
      include: include,
      order: order
    }

    fields && (o.attributes = fields)

    if (opts.page || opts.rows) {
      let page = Number(opts.page) || 1
      let rows = Number(opts.rows) || 10
      o.offset = (page - 1) * rows
      o.limit = rows
      return self.findAndCount(o)
    } else {
      return self.findAll(o)
    }
  }
}
