const Compiler = require('../compiler');
function nodeModuleBundlePlugin (compiler,options,config) {
  compiler.on('compiler-item-before',async function (item) {
    new Compiler({});
  });
}
module.exports = nodeModuleBundlePlugin;
