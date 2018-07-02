const path = require('path');
const util = require('./util');
const getOptions = function (options = {}) {
  let entry = options.entry;
  if(typeof entry === "string"){
    entry[path.dirname(entry)] = entry
  }
  if(!entry || !Object.keys(entry).length){
    const msg = 'entry 不能为空';
    console.error(msg);
    return msg
  }
  options.entry = entry;
  if(!options.extensions || !options.extensions.length){
    options.extensions = ['.js'];
  }
  let plugins = util.fixOptions(options.plugins || [],'plugin',options.resolveLoaderModule || []);
  if(options.isHot){
    plugins.shift(require('../plugins/hotPlugin.js'))
  }
  if(options.isWatch){
    plugins.shift(require('../plugins/watchPlugin.js'))
  }
  if(options.isServer){
    plugins.shift(require('../plugins/serverPlugin.js'))
  }
  options.plugins = plugins;

  return options;
}
modules.exports = getOptions;
