const error = require('jm-err')
const consts = require('../consts')
const Err = consts.Err

module.exports = function (sequelize, DataTypes) {
  const model = sequelize.define('ct',
    {
      code: {
        type: DataTypes.STRING(32),
        unique: true,
        allowNull: false,
        comment: '唯一编码',
        set: function (val) {
          this.setDataValue('code', val.toLowerCase())
        }
      },
      name: {type: DataTypes.STRING(32), unique: true, allowNull: false, comment: '唯一名称'}
    },
    {
      tableName: 'ct',
      createdAt: 'crtime',
      updatedAt: 'moditime',
      deletedAt: 'deltime',
      paranoid: true,
      comment: '币种, 1个账号对应多个币种'
    })

  let idMap = null
  let codeMap = null

  model._cacheCts = async function (bForce) {
    if (idMap && !bForce) return
    idMap = {}
    codeMap = {}
    const doc = await this.findAll({
      attributes: ['id', 'code', 'name']
    })
    doc.forEach(ct => {
      const {id, code} = ct
      idMap[id] = ct
      codeMap[code] = ct
    })
  }

  /**
   *
   * 获取货币, id 和 code 二选一， 优先使用 id
   *
   * @param id
   * @param code
   * @returns {Promise<*>}
   */
  model.get = async function ({id, code}) {
    if (!code && !id) {
      throw error.err(Err.FA_INVALID_CT)
    }

    await this._cacheCts()
    let doc = null
    if (id) {
      doc = idMap[id]
    } else {
      doc = codeMap[code]
    }
    if (!doc) {
      // 找不到时, 重新缓存
      await this._cacheCts(true)
      if (id) {
        doc = idMap[id]
      } else {
        doc = codeMap[code]
      }
    }
    return doc
  }

  return model
}
