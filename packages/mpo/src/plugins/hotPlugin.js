function getTemplate(item) {
  //http chunk 协议进行前后端通信
  let str = `(function(){
    
  })();`;
  return str;
}

//
function hotPlugin (compiler,options,config) {
  //给 entry 的js
  compiler.on('optimize',function () {
    const chunks = compiler.chunks;
    const entrys = compiler.entrys;
    for (let key in chunks){
      const item = chunks[key] || {};
      //给入口的js添加 hot replace 代码
      if(entrys[key] && item.ext === 'js'){
        item.content = getTemplate(item)+item.content;
      }
    }
  });

}
module.exports = hotPlugin;
