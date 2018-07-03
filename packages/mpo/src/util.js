const resolve = require('resolve');
const constant = require('./constant');
const cwd = process.cwd();
function Noop (){}
function getStrToArr(str,resloveModule = []){
  str = str.trim();
  const arr = str.split('?');
  let options = {},fn;
  const module = arr[0].trim();
  if(module){
    fn = constant.loaders[module] || constant.plugins[module];
    if(!fn){
      const file = resolve.sync(module,{paths: resloveModule, basedir:  cwd,isDirectory: false})
      if(file){
        fn = require(file);
      }else {
        console.error(`${module} not found`)
      }
    }
  }
  if(module && arr[1]){
    const arr1 = arr[1].split('&');
    arr1.forEach((item)=>{
      const arr2 = item.split('=');
      const key = arr2[0].trim();
      if(key){
        options[key] = arr2[1]=== undefined? true: arr2[1].trim()
      }
    })
  }
  return [fn || Noop,options];
}



//格式化参数 []
module.exports.fixOptions = function (arr = [],key,resloveModule) {
  let newArr = [];
  if(typeof arr === 'string'){
    arr = arr.split('!')
  }else if(!Array.isArray(arr)) {
    arr = [arr]
  }
  arr.forEach((item)=>{
    const type = typeof item;
    let it = {}
    if(type === 'string'){
      const strArr = getStrToArr(item,resloveModule);
      it[key] = strArr[0];
      it['options'] = strArr[1] || {};
    }else if(type === 'object'){
      it = type;
    }else if(type === 'function'){
      it[key] = item;
    }else if(Array.isArray(item)){
      it[key] = item[0] || Noop;
      it['options'] = item[1] || {};
    }
    newArr.push(it);
  })
  return newArr;
}

module.exports.queueExec = async function (arr = [],...props) {
  if (arr.length) {
    async function exec() {
      if(!arr.length) return
      const item = arr.shift();
      await item(...props)
      await exec();
    }
    await exec();
  }
}

module.exports.getEntryPaths = function (entry) {
  let arr = [];
  Object.keys(entry).forEach((item)=>{
    const paths = entry[item].paths || [];
    paths.forEach((it)=>{
      if(it && arr.indexOf(it) !== -1){
        arr.push(it)
      }
    })
  });
  return arr;
}

module.exports.getChunks = function (entry) {
  let chunks = {};
  Object.keys(entry).forEach((item)=>{
    const paths = entry[item].paths || [];
    chunks[item] = {
      isBundle : false,
      content: '',
      paths: paths
    }
  });
  return chunks
}

let id = 0;
module.exports.getId = function (entry) {
  return id++
};




