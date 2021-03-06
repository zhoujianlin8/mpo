let cacheObj = {}; //file: content;
const util = require('../util');
function ExtractTextPlugin(compiler, options, config) {
  options = Object.assign({
    filename: '[name].css',
    allChunks: true,
    chunks: [],
  },options || {});
  compiler.on('chunks-hand', ()=>{
    let chunks = compiler.chunks || {};
    const modules = compiler.modules;
    let eChunks = options.chunks || [];
    if(eChunks && eChunks.length){

    } else if(options.allChunks === true){
      eChunks = Object.keys(chunks);
    }
    eChunks.forEach((it)=>{
      const item = chunks[it];
      if(item) {
        const filename = options.filename.replace('[name]', item.name).replace('[hash]', item.hash);
        const chunk = chunks[filename];
        if (chunk && item.isBundle === true && chunk.isBundle === true) {
          chunks[filename] = chunk;
        }else{
          chunks[filename] = getChunk(filename,item,modules)
        }
      }
    });
    compiler.chunks = chunks;
  })
}

function getChunk(filename,item,modules) {
  const extName = util.getExtName(filename);
  let paths = [];
  let arrContent = [];
  item.paths.forEach((it)=>{
    if(modules[it]){
      if(cacheObj[it] !== undefined){
        paths.push(it)
      }
      doDeps(modules[it].deps || {})
    }
  });
  function doDeps (deps){
    for(let key in deps){
      const item = deps[key];
      if(modules[item]){
        if(cacheObj[item] !== undefined){
          paths.push(item)
        }
        doDeps(modules[item].deps || {})
      }
    }
  }
  paths.forEach((it)=>{
    cacheObj[it] && arrContent.push(cacheObj[it])
  });
  return {
    isBundle: false,
    isContentDeps: true,
    content: arrContent.join(''),
    paths: paths,
    ext: extName.ext,
    name: extName.name,
    hash: util.getHash(filename)
  }
}

function extract (user){
  // 不做js 输出  直接输出{} 把处理的结果缓存下来
  return async function (item,options,config) {
    const users = util.fixOptions(user,'loader',config.resolveLoaderModule);
    users.forEach((it)=>{
      if(it){
        let options = it.options || {};
        options.isToJs = false;
      }
    });
    await this.doLoaderUse(users,item);
    cacheObj[item.file] = item.content;
    item.content = 'module.export = {};';
  };
}
module.exports = ExtractTextPlugin;

module.exports.extract = extract;
