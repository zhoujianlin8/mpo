const pack = require('browser-pack');
async function  wrap(item = {},modules,options) {
  const paths = item.paths || [];
  let packs = [];
  paths.forEach((file)=>{
    const obj = Object.assign({},modules[file],{isEntry: true});
    packs.push(obj)
    if(obj.deps){
      addDeps(obj.deps)
    }
  });
  function addDeps(obj){
    for(let key in obj){
      const item = obj[key];
      if(item && modules[item]){
        packs.push({},modules[item],{isEntry: false})
      }
    }
  }
  //[{id: '1',content: 'xx',deps: {'key': '1'},isEntry: true}]
  item.content = await pack(packs,options);
  packs = null;
}


function fileOutPutPlugin (compiler,options,config) {
  if(!options || !Object.keys(options)){
    options = {

    }
  }

  options = Object.assign({

  },options);

  compiler.on('wrap-bundle',async function () {
    const modules = compiler.modules;
    const chunks = compiler.chunks;
    let arr = [];
    for (let key in chunks){
      let item = chunks[key];
      if(item.isBundle !== true){
        arr.push(wrap(item,modules,options))
      }
    }
    await new Promise.all(arr);
  })
}

module.exports = fileOutPutPlugin;
