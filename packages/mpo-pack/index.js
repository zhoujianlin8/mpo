const umd = require('umd');
const fs = require('fs');
const path = require('path');
const combineSourceMap = require('combine-source-map');
const defaultPreludePath = path.join(__dirname, '_prelude.js');
const defaultPrelude = fs.readFileSync(defaultPreludePath, 'utf8');
function wrapItem(row){
   const wrappedSource = [
    JSON.stringify(row.id),
    ':[',
    'function(require,module,exports){\n',
     row.content && combineSourceMap.removeComments(row.content),
    '\n},',
    '{' + Object.keys(row.deps || {}).sort().map(function (key) {
      return JSON.stringify(key) + ':'
        + JSON.stringify(row.deps[key])
        ;
    }).join(',') + '}',
    ']'
  ].join('');
   return wrappedSource
}
module.exports = function (opts) {
  if (!opts) opts = {};
  const basedir = opts.basedir || process.cwd();
  let prelude = opts.prelude || defaultPrelude;
  const preludePath = opts.preludePath || path.relative(basedir, defaultPreludePath).replace(/\\/g, '/');
  const packages = opts.packages || [];
  let enterys = [];
  let items = [];
  packages.forEach((item)=>{
    items.push(wrapItem(item));
    if(item.isEntry === true){
      enterys.push(item.id)
    }
  });
  const entery = enterys.length > 1 ?`[${enterys.join(',')}]` : enterys[0] || '';
  if(enterys.length > 1){
    prelude = prelude.replace('//for','for').replace('newRequire(entry)','newRequire')
  }else if(entery.length ===0){
    prelude = prelude.replace('newRequire(entry)','newRequire')
  }
  prelude = prelude.replace(/\)\(\)/g,`)({${items.join(',')}},{},${entery})`);
  const libraryTarget = opts.libraryTarget;
  const library = opts.library;

  if(libraryTarget === 'commonjs2'){
    return `module.exports = ${prelude}`
  }
  if(library && libraryTarget === 'amd'){
    return `define('${library}',function(require,module,exports){module.exports = ${prelude})`
  }
  if(libraryTarget === 'commonjs'){
    opts.commonJS = true;
  }
  return library ? umd(library,prelude,opts):prelude;
};
