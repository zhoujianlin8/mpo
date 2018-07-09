const pack = require('../../../mpo-pack/index');

async function wrap(item = {}, modules, options) {
  const paths = item.paths || [];
  let packs = [];
  let cacheIn = {};
  paths.forEach((file) => {
    const obj = Object.assign({}, modules[file], {isEntry: true});
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
        obj[key] = modulesItem.id;
        if (cacheIn[modulesItem.id]) return;
        packs.push(Object.assign({}, modules[item], {isEntry: false}))
        cacheIn[modulesItem.id] = true;
        if (!modulesItem.isContentDeps && modulesItem.deps && Object.keys(modulesItem.deps).length) {
          addDeps(modulesItem)
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



function wrapPlugin(compiler, options, config) {
  options = Object.assign({}, options);
  compiler.on('wrap-bundle', async function () {
    const modules = compiler.modules;
    const chunks = compiler.chunks;
    let arr = [];
    for (let key in chunks) {
      let item = chunks[key] || {};
      if (item.isBundle !== true) {
        arr.push(wrap(item, modules, options))
      }
    }
    await Promise.all(arr);
  })
}

module.exports = wrapPlugin;