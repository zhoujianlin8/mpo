function watchPlugin (compiler,options,config) {
  compiler.on('compiler-item-after',function (item) {
   // compiler.compiler(file)
  });
}
modules.exports = watchPlugin;
