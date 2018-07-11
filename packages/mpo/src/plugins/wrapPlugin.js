const pack = require('../../../mpo-pack/index');
const util = require('../util');
async function wrap(item = {}, modules, options) {
  const paths = item.paths || [];
  let packs = [];
  let cacheIn = {};
  paths.forEach((file) => {
    const obj = Object.assign({},modules[file], {isEntry: true});
    obj.deps = Object.assign({},obj.deps || {});
    packs.push(obj)
    cacheIn[obj.id] = true;
    if (!obj.isContentDeps && obj.deps && Object.keys(obj.deps).length) {
      addDeps(obj.deps)
    }
  });

  function addDeps(obj) {
    for (let key in obj) {
      const item = obj[key];
      const modulesItem = item && modules[item];
      if (modulesItem) {
        modulesItem.deps = Object.assign({},modulesItem.deps);
        obj[key] = modulesItem.id;
        if (cacheIn[modulesItem.id]) return;
        packs.push(Object.assign({}, modules[item], {isEntry: false}))
        cacheIn[modulesItem.id] = true;
        if (!modulesItem.isContentDeps && modulesItem.deps && Object.keys(modulesItem.deps).length) {
          addDeps(modulesItem.deps)
        }
      }
    }
  }
  //[{id: '1',content: 'xx',deps: {'key': '1'},isEntry: true}]
  if(item.ext === 'js'){
    item.content = await pack({
      packages: packs
    });
  }else{
    const otherFn = options.otherFn || concat;
    item.content = await otherFn(packs,item,concat)
  }
  packs = null;
}

function concat(packs) {
  let content = [];
  packs.forEach((item)=>{
    content.push(item.content || '')
  });
  return content.join('');
}
//{a: {name,ext,content:'xxx',paths: [],isDepContent: true}}
function wrapPlugin(compiler, options, config) {
  options = Object.assign(util.getObjBykey(config.output,['library','libraryTarget']),options);
  compiler.on('wrap-bundle', async function () {
    const modules = compiler.modules;
    const chunks = compiler.chunks;
    let arr = [];
    for (let key in chunks) {
      let item = chunks[key] || {};
      if (item.isBundle !== true && item.isContentDeps !== true) {
        arr.push(wrap(item, modules, options))
      }
    }
    await Promise.all(arr);
  })
}

module.exports = wrapPlugin;
