const { transform } = require('babel-core')
module.exports = function babel (item,config) {
  let p
  try {
    const res = transform(item.content, config)
    p = Promise.resolve(res)
  } catch (e) {
    p = Promise.reject(e)
  }
  return p
}
