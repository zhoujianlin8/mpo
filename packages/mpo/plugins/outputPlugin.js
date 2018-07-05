const fs = require('fs-extra');
const path = require('path');
function outputPlugin (compiler, options, config) {
  if(!options || !Object.keys(options)){
    options = config.output || {}
  }
  options = Object.assign({
    path: path.join(process.cwd(),'dist'),
    filename: '[name].js'
  },options);
  compiler.on('output',async function () {
    const chunks = compiler.chunks;
    await fs.ensureDir(options.path);
    let arr = [];
    Object.keys(chunks).forEach(function (it) {
      arr.push(async function (key) {
        const file = path.join(options.path,options.filename.replace('[name]',key).replace('[hash]',chunks[it].hash));
        await fs.outputFile(file, chunks[key].content,'utf-8');
        console.log(`chunck:${key} output:${file}`)
      }(it))
    })
    await Promise.all(arr)
  });
}
module.exports = outputPlugin;
