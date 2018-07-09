//
function hotPlugin (compiler,options,config) {
  //给 entry 的js
  compiler.on('optimize',function (item) {
    const chunks = compiler.chunks;
    for (let key in chunks){
      const item = chunks[key] || {};
      //给入口的js添加 hot replace 代码
      if(item.isEntry && item.ext === 'js'){

      }
    }
  });

  compiler.on('compiler-watch-after',function (file) {

  });
}
module.exports = hotPlugin;
