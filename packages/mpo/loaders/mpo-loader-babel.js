const { transform } = require('babel-core');
const LoaderMain = require('./mpo-loader-main');
module.exports = function babelLoader (item,config) {
  let p
  try {
    item.content = transform(item.content, config);
    p = Promise.resolve(LoaderMain(item))
  } catch (e) {
    p = Promise.reject(e)
  }
  return p
}
