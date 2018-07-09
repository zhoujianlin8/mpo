let cacheObj = {};
module.exports = function (file,loaders) {
  loaders = loaders || []; //[{}]
  let n = null;
  if(cacheObj[file] !== undefined){
    n = cacheObj[file];
  }else{
    let loader = {};
    for (let len = loaders.length, i = 0; i < len; i++) {
      const item = loaders[i] || {};
      if (item && item.test && item.test.test(file)) {
        loader = item;
        n = i;
        break;
      }
    }
    if (loader.exclude && loader.exclude.test(file)) {
      n = null;
    }
    cacheObj[file] = n;
  }
  if(n === null) return []
  return loaders[n] && loaders[n].use || []
};
