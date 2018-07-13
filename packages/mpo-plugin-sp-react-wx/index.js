const parseApp = require('./src/parseApp');
const parseCom = require('./src/parseCom');
const parsePage = require('./src/parsePage');
const npm = require('./src/_npm');
const path = require('path');
const fs = require('fs');
let appInfo = {}; //{ pages: [],template: '', json: '',css: ''}
let compoents = {}; //{compoents:[],json: ''}
const cwd = process.cwd();
module.exports = function (compiler,options,config) {
  const output = config.output || {};
  options = Object.assign({
    templateExt: 'wxml',
    jsonExt: 'json',
    cssExt: 'wxss',
    cssTest: /\.(css)|(less)|(scss)|(sass)|(wxss)/g,
    path: output.path || path.join(cwd,'dist'),
    //filename: output.filename || '[name].[ext]',
    baseDir: path.join(cwd,'src')
  },options || {})
  //代码中删除引用
  if(!config.resolve.removePaths){
    config.resolve.removePaths = options.cssTest;
  }
  compiler.on('compiler-item-before',async function(item){
    const type = getType(item);
    const file = item.file;
    if(type === 'app'){
      appInfo = await parseApp(item);
    }else if(type === 'page'){
      compoents[file] = await parseCom(item)
    }else if(type === 'com'){
      compoents[file] = await parseCom(item)
    }
    item.type = type;
  });
  compiler.on('compiler-item-after',async function(item){
    const type = item.type;
    //await npm(item);
    const file = item.file;
    const nameExt = getNameExt(file,type);
    const outFile = path.join(options.path,`${nameExt.name}.${nameExt.ext}`);
    //添加pages的依赖
    if(type === 'app'){
      item.deps = Object.assign(item.deps,appInfo.deps);
    }else if(type === 'page'){

    }else if(type === 'com'){

    }

    delete item.type;
  });

  function getNameExt(file,type) {
    let ext,name ;
    name = file.replace(/\.([a-z]+)$/g, function (w, $1) {
      ext = $1;
      return ''
    });
    if(type){
      ext = 'js'
    }else if(options.cssTest(file)){
      ext = options.cssExt
    }
    name = name.replace(options.baseDir,'').replace(/^[\s\S]*node_modules[\\\/]/,'_npm/');
    return {
      name: name,
      ext: ext
    }
  }

  function getType(item) {
    if(item.isRoot){
      return 'app'
    }
    const pages = Object.values(appInfo.deps || {});
    if(pages.indexOf(item.file) !== -1){
      return 'page'
    }


  }
};
