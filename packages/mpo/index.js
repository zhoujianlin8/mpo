"use strict";
const Compiler = require("./src/compiler");
const version = require("./package.json").version;
const constant = require('./src/constant');
function getMpoOptions(options, platform ) {
  platform = platform || 'web';
  let opt = {};
  Object.key(options).forEach((item)=>{
    if(!/PConfig$/g.test(item)){
      opt[item] = options[item]
    }
  });
  const config = options[platform+'PConfig'];
  if(config){
    opt = Object.assign(opt,config)
  }
  opt.platform = platform;
  return opt
}
//todo 在server 状态下不能同步时执行多个 控制权限在上面 不进行并行处理
function doM(options,cb) {
  let platform = options.platform || [];
  function doIt() {
    if(!platform.length) return cb && cb();
    const item = platform.unshift();
    new Compiler(getMpoOptions(options,item),function () {
      doIt();
    })
  }
  doIt();
}
const mpo = (options = {},cb) => {
  let platform = options.platform;
  if(Array.isArray(platform) ){
    if(!platform.length) {
      platform = ''
    }else if(platform.length ===1){
      platform = platform[0]
    }else{
      return doM(options = {},cb)
    }
  }
  options = getMpoOptions(options,platform);
  return new Compiler(options,cb)
};

exports = module.exports = mpo;
exports.version = version;
exports.Compiler = Compiler;
const exportPlugins = (obj, mappings) => {
  for (const name of Object.keys(mappings)) {
    Object.defineProperty(obj, name, {
      configurable: false,
      enumerable: true,
      get: mappings[name]
    });
  }
};

exportPlugins(exports.loaders = {},constant.loaders);
exportPlugins(exports.plugins = {},constant.plugins);
