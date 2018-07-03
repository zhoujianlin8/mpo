const Message = require('./message');
const Util = require('./util');
const getOptions = require('./getOptions');
const fs = require('fs');
class Compiler extends Message {
  constructor(options = {}, cb) {
    super();
    this.modules = {}; // {path {content, imports, isRoot: true}}
    const opt = this.options = getOptions(options);
    if(typeof opt === 'string') return cb({error: true, opt});
    this.chunks = Util.getChunks(opt.entry);  //{name: { paths: [], content: '', isCache: false }}
    console.log('this.chunks',this.chunks)
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
    this.entryFiles = Util.getEntryPaths(this.options.entry);
    await this.fire('compiler-before', this);
    await this._compiler();
    await this.fire('compiler-after', this);
    await this._outputFiles();
    cb && cb(this);
  }
  async _outputFiles(){
    await this.fire('wrap-bundle',this);
    await this.fire('optimize',this);
    await this.fire('output', this);
    //全部设置为已编译
    Object.keys(this.chunks).forEach((key)=>{
      this.chunks[key]['isBundle'] = true;
    })
  }
  async _compiler() {
    if (this.entryFiles && this.entryFiles.length) {
      let arr = [];
      this.entryFiles.forEach((item) => {
        arr.push(this._compilerItem(item))
      })
      return Promise.all(arr)
    }
  }

  async _compilerItem(file) {
    const isEntry = this.entryFiles.indexOf(file) !== -1;
    let content = fs.readFileSync(file,'utf-8');
    const oldObj = this.modules[file] || {};
    const id = oldObj.id || Util.getId();
    let moduleObj = {
      id: id,
      isEntry: isEntry,
      content: content,
      isContentDeps: false,
      deps: {},
      file: file
    };
    await this.fire('compiler-item-before', this, moduleObj);
    await this._loaderHand(moduleObj);
    await this.fire('compiler-item-after', this, moduleObj);
    moduleObj.id = id;
    this.modules[file] = moduleObj;
    await this.fire('compiler-item-output', this, moduleObj);
    if (!moduleObj.isContentImports && moduleObj.deps && Object.keys(moduleObj.deps).length) {
      let arrDep = [];
      Object.keys(moduleObj.deps).forEach((dep) => {
        const file = moduleObj.deps[dep];
        file && !oldObj.id && arrDep.push(this._compilerItem(file))
      });
      await Promise.all(arrDep)
    }
  }
  async watchCompiler(file,cb){
    await this._compilerItem(file,true)
    await this.fire('compiler-watch-after',this,file);
    await this._outputFiles()
    cb && cb();
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
      let newUses = [];
      uses.forEach((item)=>{
        item.loader && newUses.push(item.loader.bind(this,moduleObj,item.options))
      });
      await Util.queueExec(newUses)
    }
  }
}

module.exports = Compiler;
