const resolve = require('resolve');
const constant = require('./constant');
const crypto = require('crypto');
const cwd = process.cwd();
const fs = require('fs');

function Noop() {
}

function getStrToArr(str, resloveModule = []) {
  str = str.trim();
  const arr = str.split('?');
  let options = {}, fn;
  const module = arr[0].trim();
  if (module) {
    fn = constant.loaders[module] || constant.plugins[module];
    if (!fn) {
      let file
      try {
        file = resolve.sync(module, {paths: resloveModule, basedir: cwd, isDirectory: false})
      } catch (e) {
        console.error(e)
      }
      if (file) {
        fn = require(file);
      } else {
        console.error(`${module} not found`)
      }
    }
  }
  if (module && arr[1]) {
    const arr1 = arr[1].split('&');
    arr1.forEach((item) => {
      const arr2 = item.split('=');
      const key = arr2[0].trim();
      if (key) {
        options[key] = arr2[1] === undefined ? true : arr2[1].trim()
      }
    })
  }
  return [fn || Noop, options];
}

function getExtName(file) {
  let ext = 'js';
  let item = file;
  item = item.replace(/\.([a-z]+)$/g, function (w, $1) {
    ext = $1;
    return ''
  });
  return {
    ext: ext,
    name: item
  }
}

//格式化参数 []
module.exports.fixOptions = function (arr = [], key, resloveModule) {
  let newArr = [];
  if (typeof arr === 'string') {
    arr = arr.split('!')
  } else if (!Array.isArray(arr)) {
    arr = [arr]
  }
  arr.forEach((item) => {
    const type = typeof item;
    let it = {}
    if (type === 'string') {
      const strArr = getStrToArr(item, resloveModule);
      it[key] = strArr[0];
      it['options'] = strArr[1] || {};
    } else if (type === 'object') {
      if (typeof item[key] === 'string') {
        item[key] = getStrToArr(item[key], resloveModule)[0]
      }
      it = item;
    } else if (type === 'function') {
      it[key] = item;
    } else if (Array.isArray(item)) {
      if (typeof item[0] === 'string') {
        item[0] = getStrToArr(item[0], resloveModule)[0]
      }
      it[key] = item[0] || Noop;
      it['options'] = item[1] || {};
    }
    newArr.push(it);
  })
  return newArr;
}

module.exports.queueExec = async function (arr = [], ...props) {
  if (arr.length) {
    async function exec() {
      if (!arr.length) return
      const item = arr.shift();
      await item(...props)
      await exec();
    }

    await exec();
  }
}

module.exports.getEntryPaths = function (entry) {
  let arr = [];
  Object.keys(entry).forEach((item) => {
    const paths = entry[item] || [];
    paths.forEach((it) => {
      if (it && arr.indexOf(it) === -1) {
        arr.push(it)
      }
    })
  });
  return arr;
}


function getHash(key) {
  return crypto.createHash('sha256').update(key).digest('hex')
}


module.exports.getChunks = function (entry) {
  let chunks = {};
  Object.keys(entry).forEach((item) => {
    const paths = entry[item] || [];
    const extName = getExtName(item);
    chunks[item] = {
      isBundle: false,
      content: '',
      paths: paths,
      ext: extName.ext,
      name: extName.name,
      hash: getHash(item)
    }
  });
  return chunks
}

let id = 1;
module.exports.getId = function (entry) {
  return id++
};

function getPath(str) {
  if (fs.existsSync(str)) return str;
  let nStr = null;
  try {
    nStr = resolve.sync(str, {basedir: cwd, isDirectory: false})
  } catch (e) {
    console.error(e)
  }
  if (!nStr) {
    console.error(`not found path ${str}`)
  }
  return nStr
}

module.exports.getEntry = function (entry) {
  Object.keys(entry).forEach((item) => {
    let paths = [];
    if (Array.isArray(entry[item])) {
      entry[item].forEach((it) => {
        paths.push(getPath(entry[item][it]));
      })
    } else {
      paths.push(getPath(entry[item]));
    }
    entry[item] = paths
  });
  return entry || {};
}

module.exports.getHash = getHash;

module.exports.getExtName = getExtName;

module.exports.fileInEntryModule = function (file, entry, modules) {
  let b = false;

  function find(en) {
    const entryObj = modules[en] || {};
    if (entryObj.deps && Object.keys(entryObj.deps).length) {
      for (let key in entryObj.deps) {
        if (entryObj.deps[key] === file) {
          b = true
        } else {
          find(entryObj.deps[key])
        }
      }
    }
  }

  find(entry);
  return b
}

module.exports.getObjBykey = function (obj = {}, keys) {
  if (typeof keys === 'string') {
    keys = [keys]
  }
  let newObj = {};
  keys.forEach((it) => {
    if(obj[it] !== undefined){
      newObj[it] = obj[it]
    }
  });
  return newObj
}
