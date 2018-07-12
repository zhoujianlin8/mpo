const uglifyJS = require('uglify-js')
function uglifyJSPlugin(compiler, options) {
  options = Object.assign({
    compress: {
      unused: true,
      dead_code: true,
      warnings: false
    },
    //不进行混淆
    mangle: {
     // except: ['$', 'exports', 'require', 'module', 'define','React','ReactDom','jQuery']
    }
  }, options);

  async function uglify(item){
    try{
      item.content = uglifyJS.minify(item.content, options).code || ''
    }catch (e) {
      console.error(e)
    }
  }
  compiler.on('optimize',async function () {
    const chunks = compiler.chunks || {};
    let arr = [];
    for (let key in chunks) {
      let item = chunks[key] || {};
      if (item.ext === 'js') {
        arr.push(uglify(item))
      }
    }
    arr.length && await Promise.all(arr);
  })
}

module.exports = uglifyJSPlugin;
