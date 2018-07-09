/*
*  {
*    alias: {},
*    extensions : [],
*    key: '',
*    file: file
*  }
* */
const path = require('path');
const fs = require('fs');
const resolve = require('resolve');
const cwd = process.cwd();
let cacheObj = {};
module.exports = async function (config) {
  const file = config.file;
  let key = config.key.trim();
  const isRe = /^\.[\.\\\/]+/g.test(key);
  const cacheKey = isRe ? file+'_'+key : key;
  //未找到可能添加后已找到
  if(cacheObj[cacheKey] !== undefined && cacheObj[cacheKey] !== null) return cacheObj[cacheKey];
  let filePath = null;
  const alias = config.alias || {};
  if(isRe){
    key = path.resolve(path.dirname(file),key);
  }else{
    if(alias[key]){
      key = alias[key]
    }else{
      key = /^([^\\\/])+[\\\/]/g.replace(key,function (work,$1) {
        if(alias[$1]){
          return alias[$1]+'/'
        }
        return work
      })
    }
  }
  try{
    filePath = resolve.sync(key,{basedir: cwd,extensions: config.extensions,isDirectory: false})
  }catch (e) {
    console.error(e)
  }
  cacheObj[cacheKey] = filePath;
  return filePath
};
