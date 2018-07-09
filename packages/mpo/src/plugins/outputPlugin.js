const fs = require('fs-extra');
const path = require('path');
function outputPlugin (compiler, options, config) {
  if(!options || !Object.keys(options)){
    options = config.output || {}
  }
  options = Object.assign({
    path: path.join(process.cwd(),'dist'),
    filename: '[name].[ext]'
  },options);
  compiler.on('output',async function () {
    const chunks = compiler.chunks;
    await fs.ensureDir(options.path);
    let arr = [];
    Object.keys(chunks).forEach(function (it) {
      const item = chunks[it] || {};
      item.isBundle !== true && arr.push(async function (key) {
        const file = item.distFile || path.join(options.path,options.filename.replace('[name]',item.name || key).replace('[hash]',item.hash).replace('[ext]',item.ext || 'js'));
        await fs.outputFile(file, chunks[key].content,'utf-8');
        console.log(`chunck:${key} output:${file}`)
      }(it))
    })
    await Promise.all(arr)
  });
}
module.exports = outputPlugin;
