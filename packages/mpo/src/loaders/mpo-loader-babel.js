const { transform } = require('@babel/core');
module.exports = function babelLoader (item,options,config) {
  options = Object.assign({

  },options)
  let p
  try {
    item.content = transform(item.content, options).code;
  } catch (e) {

  }
}
