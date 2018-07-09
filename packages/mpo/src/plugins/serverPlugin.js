const http = require('http');
const path = require('path');
const fs = require('fs');
async function hanlderHmr(req,res) {

}
async function sendHmr(obj) {

}

function types(res,type) {

}

function serverPlugin (compiler,options,config) {
  options = {
    port: options.port || config.port || 3000,
    cwd: options.cwd || config.cwd || process.cwd(),
    isChunks: true,
    isHot: true
  };

  //compiler-after
  compiler.on('compiler-after',function () {
    http.createServer((req, res) => {
      hanlder(req, res).then((body)=>{

      }).catch(function (e) {
        console.error(e)
      })
    }).listen(options.port)
  });

  //watch 变化
  compiler.on('compiler-watch-after',function (file,items) {
    sendHmr({
      type: 'hot',
      ids: []
    })
  });


  async function hanlder(req,res,chunks) {
    const url = req.url;
    if(options.isHot && url === 'hmr'){
      await hanlderHmr(req,res)
    }else if(options.isChunks && chunks[url]){
      const ext = 'js';
      types(res,ext);
      req.end()
    }else if(fs.existsSync(path.join(options.cwd,url))){
      types(res,'css');
      req.end()
    }
  }

 // process.on('')

}
module.exports = serverPlugin;
