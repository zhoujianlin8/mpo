const Message = require('message');
const Util = require('./util');
const getOptions = require('./src/getOptions');
const fs = require('fs');
class Compiler extends Message {
  constructor(options = {}, cb) {
    super();
    this.modules = {}; // {path {content, imports, isRoot: true}}
    const opt = this.options = getOptions(options);
    if(typeof opt === 'string') return cb({error: true, opt});
    // 加载插件
    this._initPlugins(opt.plugins);
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
    this.entryFiles = Util.getEntryPaths(this.options.entry,this.options.extensions || []);

    await this.fire('compiler-before', this);
    await this._compiler();
    await this.fire('compiler-after', this);
    await this.fire('wrap-bundle',this);
    await this.fire('output', this);
    cb && cb(this);
  }
  async _compiler() {
    if (this.enterFiles && this.enterFiles.length) {
      let arr = [];
      this.enterFiles.forEach((item) => {
        arr.push(this._compilerItem(item))
      })
      return Promise.all(arr)
    }
  }

  async _compilerItem(file) {
    const isRoot = this.enterFiles.indexOf(file) !== -1;
    let content = fs.readFileSync(file,'utf-8');
    let moduleObj = {
      isRoot: isRoot,
      content: content,
      isContentImports: false,
      imports: [],
      importsPaths: [],
      file: file
    };
    await this.fire('compiler-item-before', this, moduleObj);
    await this._loaderHand(moduleObj);
    await this.fire('compiler-item-after', this, moduleObj);
   // this.modules[file] = moduleObj;
    await this.fire('compiler-item-output', this, moduleObj);
    if (!moduleObj.isContentImports && moduleObj.importsPaths && moduleObj.importsPaths.length) {
      let arrDep = []
      moduleObj.importsPaths.forEach((dep) => {
        dep && !this.modules[dep] && arrDep.push(this._compilerItem(dep))
      })
      await Promise.all(arrDep)
    }
  }
  async watchCompiler(file){
    await this._compilerItem(file)
    await this.fire('compiler-watch-after',this,file);
    await this.fire('wrap-bundle',this,file);
    await this.fire('output', this);
  }
  async _loaderHand(moduleObj) {
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
      let newUses = []
      uses.forEach((item)=>{
        item.loader && newUses.push(item.loader.bind(this,moduleObj,item.options))
      })
      await Util.queueExec(newUses)
    }
  }
}

modules.exports = Compiler
