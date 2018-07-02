/*
*  {
*    alais: {},
*    externals : [],
*    key: '',
*    file: file
*  }
* */
const path = require('path');
const fs = require('fs');
const resolve = require('resolve');
let cacheObj = {};
// 未找到 null , 忽略 false
module.exports = function (config) {
  const file = config.file;
  const key = config.key.trim();
  const isRe = /^[.\/]+/g.test(key);
  const cacheKey = isRe ? file+'_'+key : key;
  //未找到可能添加后已找到
  if(cacheObj[cacheKey] !== undefined || cacheObj[cacheKey] !== null) return cacheObj[cacheKey];
  let filePath = null;
  if(isRe){
    filePath = path.resolve(file, key);
  }else{

  }
  cacheObj[cacheKey] = filePath;
  return filePath
};
