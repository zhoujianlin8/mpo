//获取依赖核心
const generator = require('@babel/generator').default;
const {parseAsync,traverse} = require('@babel/core');
const getFilePath = require('../src/getFilePath');
function replacePlatform(content,platform){
  return content.replace('process.platform',platform)
}

function replaceNodeEnv (content){
  return content.replace('process.NODE_ENV',process.env.NODE_ENV || 'production')
}

async function getImports (content,externals = {}){
  let ast = await parseAsync(content);
  let imports = [];
  let external = [];
  let dImports = []
  traverse(ast,{
    ImportDeclaration (astPath) {
      const node = astPath.node
      const source = node.source
      let value = source.value
      if(value){
        if(externals[value]){
          external.push(value);
          //替换值
          
          //astPath.replaceWithSourceString(externals[value]);
        }else{
          imports.push(value)
        }
      }
    },
    CallExpression (astPath) {
      const node = astPath.node;
      const callee = node.callee;
      const args = node.arguments;
      let value = args[0].value;
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
    code: generator(ast).code || '',
    imports: imports,
    dImports: [],
    externals: external
  }
}

module.exports = async function loaderMain (item,options,config) {
  item.content = replaceNodeEnv(replacePlatform(item.content,config.platform));
  let obj = await getImports(item.content,config.externals || {});
  let imports = obj.imports || [];
  let deps = {};
  let arr = [];
  imports.forEach((k)=>{
    arr.push(async function f(key) {
      deps[key] = await getFilePath({
        file: item.file,
        key: key,
        extensions: config.extensions,
        alias: config.alias || {},
      }(k))
    })
  });
  await Promise.all(arr);
  item.content = obj.code;
  item.deps = deps;
  obj = null;
};
