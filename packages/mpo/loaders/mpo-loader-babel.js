const { transform } = require('@babel/core');
const LoaderMain = require('./mpo-loader-main');


module.exports = function babelLoader (item,options,config) {
  options = Object.assign({

  },options)
  let p
  try {
    item.content = transform(item.content, options).code;
    p = Promise.resolve(LoaderMain.apply(this,[item,{},config]))
  } catch (e) {
    p = Promise.reject(e)
  }
  return p
}
