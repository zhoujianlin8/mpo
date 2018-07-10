//获取依赖关系核心代码
const generator = require('@babel/generator').default;
const {parseAsync,traverse,types,template} = require('@babel/core');
const getFilePath = require('./getFilePath');
function replacePlatform(content,platform){
  return content.replace('process.platform',`'${platform}'`)
}

function replaceNodeEnv (content){
  return content.replace('process.NODE_ENV',`'${process.env.NODE_ENV || "production"}'`)
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
    //str = `var ${arrSpecifier.join(' , ')};`;
    //str =  template('var a = react')();
    //str = types.stringLiteral(str)
  }
  return str
}
async function getImports (content,externals = {}){
  let ast = await parseAsync(content);
  let imports = [];
  let external = [];
  let dImports = [];
  traverse(ast,{
    ImportDeclaration (astPath) {
      const node = astPath.node
      const source = node.source
      let value = source.value
      if(value){
        if(externals[value]){
          external.push(value);
          //替换值
          // import a,{} from 'xx';
          //import 'xx';
          //const c={a} = obj;
         // astPath.insertAfter('var a = s;')
          //astPath.replaceWithSourceString(getString(node,externals[value]));
        }else{
          imports.push(value)
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
            imports.push(value)
          }
        }
      }else if(callee.name === 'import'){
        if(value){
          dImports.push(value)
        }
      }
    },
  });
  return {
    ast:ast,
    code: external.length? generator(ast).code || '' : content,
    imports: imports,
    dImports: [],
    externals: external
  }
}

module.exports = async function loaderMain (item,options,config) {
  item.content = replaceNodeEnv(replacePlatform(item.content,config.platform));
  //不再浪费时间
  if(item.isContentDeps === true) return;
  let obj = await getImports(item.content,config.externals || {});
  let imports = obj.imports || [];
  let deps = {};
  let arr = [];
  imports.forEach((k)=>{
    arr.push(async function (key) {
      deps[key] = await getFilePath({
        file: item.file,
        key: key,
        extensions: config.extensions,
        alias: config.alias || {},
      })
    }(k))
  });
  await Promise.all(arr);
  item.content = obj.code;
  item.deps = deps;
  obj = null;
};
