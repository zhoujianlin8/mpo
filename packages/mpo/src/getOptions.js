const path = require('path');
const util = require('./util');
const getOptions = function (options = {}) {
  let entry = options.entry;

  if(!options.extensions || !options.extensions.length){
    options.extensions = ['.js'];
  }
  options.entry = util.getEntry(entry);
  let plugins = util.fixOptions(options.plugins || [],'plugin',options.resolveLoaderModule || []);

  if(options.isHot){
    plugins.push({plugin:require('./plugins/hotPlugin.js')})
  }
  if(options.isWatch){
    plugins.push({plugin:require('./plugins/watchPlugin.js')})
  }
  if(options.isServer){
    plugins.push({plugin:require('./plugins/serverPlugin.js')})
  }
  //整理loader
  let loaders = options.loaders || [];
  loaders.forEach((item)=>{
    if(item && item.use){
      item.use = util.fixOptions(item.use, 'loader')
    }
  });
  options.plugins = plugins;
  options.loaders = loaders;
  return options;
}
module.exports = getOptions;
