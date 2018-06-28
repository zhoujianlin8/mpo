function fileOutPutPlugin (compiler,options,config) {
  compiler.on('compiler-after',function () {
    // compiler.compiler(file)
  });
}
modules.exports = fileOutPutPlugin;
