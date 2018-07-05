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
    combineSourceMap.removeComments(row.content),
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
  const entery = enterys.length > 1 ? enterys[0] || '': `[${enterys.join(',')}]`;
  prelude = prelude.replace(/\)\(\)/g,`)({${items.join(',')}},{},${entery})`);
  if(enterys.length > 1){
    prelude = prelude.replace('// for','for').replace('newRequire[entry]','newRequire')
  }else if(entery.length ===0){
    prelude = prelude.replace('newRequire[entry]','newRequire')
  }
  //amd
  //cmd
  //var
  //umd
  return opts.name ? umd(opts.name,prelude,opts):prelude;
};
