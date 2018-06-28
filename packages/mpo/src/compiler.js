const Message = require('message');
const Util = require('./util');
const GetOptions = require('./src/getOptions');
const fs = require('fs');
class Compiler extends Message {
  constructor(options = {}, cb) {
    super();
    this.modules = {}; // {path {content, deps, isRoot: true}}
    this.chuncks = {}; //output chunck
    this.options = GetOptions(options);
    // 加载插件
    this._initPlugins(Util.fixOptions(options.plugins,'plugin'));
    this._init(cb);
  }

  _initPlugins(plugins) {
    //[plugin,plugin]
    plugins.forEach((item = {}) => {
      if (item.plugin) {
        new item.plugin(this, item.options)
      }
    })
  }

  async _init(cb) {
    await this.fire('compiler-before', this);
    await this._compiler();
    await this.fire('compiler-after', this);
    cb && cb(this);
  }

  async _compiler() {
    if (this.enterFiles && this.enterFiles.length) {
      let arr = [];
      this.enterFiles.forEach((item) => {
        arr.push(this.compiler(item))
      })
      return Promise.all(arr)
    }
  }

  async compiler(file) {
    const isRoot = this.enterFiles.indexOf(file) !== -1;
    let content = fs.readFileSync(file,'utf-8');
    let moduleObj = {
      isRoot: isRoot,
      content: content,
      isContentDeps: false,
      deps: [],
      file: file
    };
    await this.fire('compiler-item-before', this, moduleObj);
    await this.loaderHand(moduleObj);
    await this.fire('compiler-item-after', this, moduleObj);
    this.modules[file] = moduleObj;
    if (moduleObj.isContentDeps && moduleObj.deps && moduleObj.deps.length) {
      let arrDep = []
      moduleObj.deps.forEach((dep) => {
        !this.modules[dep] && arrDep.push(this.compiler(dep))
      })
      await Promise.all(arrDep)
    }
  }
  async watchCompiler(file){
    await this.compiler(file)
    await this.fire('compiler-watch-after',this,file)
  }
  async loaderHand(moduleObj) {
    const file = moduleObj.file;
    const loaders = this.options.loaders || []; //[{}]
    let loader = {};
    for (let len = loaders.length, i = 0; i < len; i++) {
      const item = loaders[i] || {};
      if (item && item.test && item.test.test(file)) {
        loader = item;
        break;
      }
    }
    if (loader.exclude && loader.exclude.test(file)) return;
    if (loader.use) {
      const uses = Util.fixOptions(loader.use,'loader');
      await Util.queueExec(uses,moduleObj)
    }
  }
}

modules.exports = Compiler
