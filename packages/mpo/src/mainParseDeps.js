//获取依赖关系核心代码
const generator = require('@babel/generator').default;
const {parseAsync,traverse,types,template} = require('@babel/core');
const getFilePath = require('./getFilePath');
function replacePlatform(content,platform){
  return content.replace('process.env.platform','process.platform').replace('process.platform',`'${platform}'`)
}

function replaceNodeEnv (content){
  return content.replace('process.env.NODE_ENV','process.NODE_ENV').replace('process.NODE_ENV',`'${process.env.NODE_ENV || "production"}'`)
}

//todo 不支持* as的语法
//支持 import React , {Component} from 'react';
function getString(node,value) {
  const specifiers = node.specifiers || [];
  let str = `${value};`
  if(specifiers.length){
    let arrSpecifier = [];
    specifiers.forEach((item)=>{
      const name = item.local &&  item.local.name || '';
      if(!name) return;
      if(item.type === 'ImportSpecifier'){
        arrSpecifier.push(`${name} = ${value}.${name}`)
      }else if(item.type === 'ImportDefaultSpecifier'){
        arrSpecifier.push(`${name} = ${value}`);
      }
    });
    //str = 'const '+(ImportDefaultSpecifier?  ImportDefaultSpecifier +' = ': '')+(arrSpecifier.length ?`{ ${arrSpecifier.join(' , ')} } = `:'')+str
     str = template.ast`var ${arrSpecifier.join(' , ')}`
  }
  return str
}

async function getImports (content,reslove){
  const {externals = {},ignorePares,removePaths} = reslove || {};
  let ast = await parseAsync(content,{
    plugins: [require('@babel/plugin-syntax-dynamic-import')]
  });

  let imports = [];
  let external = [];
  let dImports = [];
  function handImport(value,arr,astPath){
    if(ignorePares && ignorePares.test(value)){}else{
      arr.push(value)
    }
    if(removePaths && removePaths.test(value)){
      astPath.remove();
      return true;
    }
  }
  let isEs6 = false;
  traverse(ast,{
    ImportDeclaration (astPath) {
      const node = astPath.node
      const source = node.source
      let value = source.value
      if(value){
        if(externals[value]){
          external.push(value);
          astPath.replaceWith(getString(node,externals[value]));
        }else{
          if(!handImport(value,imports,astPath)){

          }
        }
      }
    },
    CallExpression (astPath) {
      const node = astPath.node;
      const callee = node.callee;
      const args = node.arguments;
      let value= args[0] && args[0].value ;
      if (callee.name === 'require') {
        if(value){
          if(externals[value]){
            external.push(value);
            //替换值
            astPath.replaceWithSourceString(externals[value]);
          }else{
            handImport(value,imports,astPath)
          }
        }
      }else if(callee.type === 'Import'){
        if(value){
          if(!handImport(value,dImports,astPath)){
            astPath.replaceWith(template.ast`require.ensure ('${value}')`);
          }
        }
      }else if(callee.type === 'MemberExpression' && callee.object.name === 'require' && callee.property.name === 'ensure'){
        if(value){
          handImport(value,dImports,astPath)
        }
      }
    },
  });
  //todo 不处理输出格式 用户自行处理 只进行依赖分析
  if(isEs6 ){

  }

  return {
    ast:ast,
    code:  generator(ast).code || '',
    imports: imports,
    dImports: dImports,
    externals: external
  }
}

module.exports = async function loaderMain (item,options,config) {
  item.content = replaceNodeEnv(replacePlatform(item.content,config.platform));
  //不再浪费时间
  if(item.isContentDeps === true) return;
  let obj = await getImports(item.content,options);
  async function getObj(imports = []) {
    let deps = {};
    let arr = [];
    imports.forEach((k)=>{
      arr.push(async function (key) {
        deps[key] = await getFilePath({
          file: item.file,
          key: key,
          extensions: options.extensions,
          alias: options.alias || {},
        })
      }(k))
    });
    await Promise.all(arr);
    return deps
  }
  item.content = obj.code;
  const asyncDeps = await getObj(obj.dImports);
  const deps = await getObj(obj.imports);
  //异步依赖也是依赖处理
  item.deps = Object.assign(deps,asyncDeps);

  //是否分离实现由输出wrapPlugin决定 给出依赖关系数据即可
  item.asyncDeps = asyncDeps;
  obj = null;
};
