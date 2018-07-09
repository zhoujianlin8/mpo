const chokidar = require('chokidar');

function watchPlugin(compiler, options, config) {
  options = Object.assign({
    exclude: /node_module/g,
  }, options);
  let objFile = {};

  const watcher = new chokidar.FSWatcher();
  //添加监听
  compiler.on('compiler-item-after', function (item) {
    const file = item.file;
    if (objFile[file] || (options.exclude && options.exclude.test(file))) {
      return;
    }
    objFile[file] = true;
    console.log('file',file);
    watcher.add(file)
  });
  let arrWatch = [];
  let isCompiler = false;
  watcher.on('change', (path, status) => {
    const a = arrWatch.find((item = {}) => {
      return item.path === path && item.status === status
    });
    if (a) return;
    arrWatch.push({path: path, status: status});
    watchCompiler()
  });

  function watchCompiler() {
    if (isCompiler || !arrWatch.length) return;
    const watchObj = arrWatch.shift();
    const status = watchObj.status;
    const file = watchObj.path;
    //模块删除了
    if (status === 'unlink') {
      objFile[file] = false;
      watcher.remove(file);
      const moduleObj = compiler.modules[file];
      //是入口文件 删除值
      if (moduleObj.isEntry) {
        compiler.removeEntryCompiler({})
      } else {
        //找到依赖报错 否则不处理
      }
      delete compiler.modules[file];
      return watchCompiler();
    }
    isCompiler = true;
    compiler.watchCompiler(file).then(() => {
      isCompiler = false;
      watchCompiler();
    }).catch((e) => {
      isCompiler = false;
      watchCompiler();
      console.error(e)
    })
  }
}

module.exports = watchPlugin;