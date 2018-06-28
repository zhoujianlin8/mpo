const resolve = require('resolve');

function Noop (){}
function getStrToArr(str,resloveModule = []){
  str = str.trim();
  const arr = str.split('?');
  let options = {},fn = Noop;
  const module = arr[0].trim();
  if(module){
    const file = resolve.sync(module,{paths: resloveModule, basedir:  process.cwd(),isDirectory: false})
    if(file){
      fn = require(file) || Noop;
    }else{
      console.error(`${module} not found`)
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
  return [fn,options];
}

//格式化参数 []
modules.exports.fixOptions = function (arr = [],key,resloveModule) {
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
      it[key] = strArr[0] || Noop;
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
  return arr;
}

modules.exports.queueExec = async function (arr = [],...props) {
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

