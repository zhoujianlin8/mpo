const path = require('path');
const util = require('./util');
const resolve = require('resolve');

const fs = require('fs');
function getPath(str){
  if(fs.existsSync(str)) return str;
  let nStr = null;
  if(/^[\\/]/g.test(str)){
    nStr = path.join(cwd,str);
    if(!fs.existsSync(nstr)){
      nStr = null;
    }
  }else if(/^\.[.\\/]+/.test(str)){
  }else {
    nStr = resolve.sync(str,{basedir: cwd,isDirectory: false})
  }
  if(!nStr){
    console.error(`not found path ${str}`)
  }
  return nStr
}
function getEntry(entry) {
    let entryFiles = [];
    Object.keys(entry).forEach((item)=>{
      const paths = []
      if(Array.isArray(entry[item])){
        entry[item].forEach((it)=>{
          paths.push(getPath(entry[item][it]));
        })
      }else{
        paths.push(getPath(entry[item]));
      }
      entry[item].paths = paths
    });
    return entryFiles;
}
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

  if(!options.extensions || !options.extensions.length){
    options.extensions = ['.js'];
  }
  options.entry = getEntry(entry);
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
module.exports = getOptions;
