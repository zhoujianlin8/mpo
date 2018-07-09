const Message = require('./message');
const Util = require('./util');
const getOptions = require('./getOptions');
const mainParseDeps = require('./mainParseDeps');
const fs = require('fs');
const path = require('path');

class Compiler extends Message {
  constructor(options = {}, cb) {
    super();
    this.modules = {}; // {path {content, imports, isRoot: true}}
    const opt = this.options = getOptions(options);
    if (typeof opt === 'string') return cb({error: true, opt});
    //{name: { paths: [], content: '', isBundle: false }}
    this.entrys = opt.entry || {};
    this.chunks = Util.getChunks(this.entrys);
    this.entryFiles = Util.getEntryPaths(this.entrys);
    // 加载插件
    this._initPlugins(opt.plugins);
    this.run(cb);
  }

  _initPlugins(plugins) {
    //[plugin,plugin]
    plugins.forEach((item = {}) => {
      if (item.plugin) {
        new item.plugin(this, item.options, this.options)
      }
    })
  }

  async run(cb) {
    await this.fire('compiler-before');
    await this._compiler(this.entryFiles);
    await this._outputFiles();
    await this.fire('compiler-after');
    cb && cb(this);
  }

  async _outputFiles() {
    await this.fire('chunks-hand');
    await this.fire('wrap-bundle');
    await this.fire('optimize');
    await this.fire('output');
    //全部设置为已编译
    Object.keys(this.chunks).forEach((key) => {
      this.chunks[key]['isBundle'] = true;
    })
  }

  async _compiler(entryFiles = []) {
    if (entryFiles.length) {
      let arr = [];
      entryFiles.forEach((item) => {
        arr.push(this._compilerItem(item))
      });
      return Promise.all(arr)
    }
  }

  async _compilerItem(file) {
    const isEntry = this.entryFiles.indexOf(file) !== -1;
    let content = fs.readFileSync(file, 'utf-8');
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
    await this.fire('compiler-item-before', moduleObj);
    await this._loaderHand(moduleObj);
    //extensions 判断依据
    const extname = path.extname(file)
    if (extname === '.js' || (this.options.extensions.indexOf(extname) !== -1 && extname !== '.json' && extname !== '.node')) {
      await mainParseDeps(moduleObj, {}, this.options);
    }
    await this.fire('compiler-item-output', moduleObj);
    moduleObj.id = id;
    this.modules[file] = moduleObj;
    await this.fire('compiler-item-after', moduleObj);

    if (!moduleObj.isContentDeps && moduleObj.deps && Object.keys(moduleObj.deps).length) {
      let arrDep = [];
      Object.keys(moduleObj.deps).forEach((dep) => {
        const file = moduleObj.deps[dep];
        file && !oldObj.id && arrDep.push(this._compilerItem(file))
      });
      await Promise.all(arrDep)
    }
  }

  //watch 编译执行
  async watchCompiler(file) {
    //删除入口chunk缓存
    let chunks = this.chunks || {};
    let modules = this.modules || {};
    let items = [];
    for(let key in chunks){
      let item = chunks[key] || {};
      if(item.paths){
        item.paths.forEach((it)=>{
          if(file === it){
            item.isBundle = false;
            items.push(item)
          }else if(Util.fileInEntryModule(file,it,modules)){
            item.isBundle = false;
            items.push(item)
          }
        })
      }
    }


    await this._compilerItem(file);
    await this._outputFiles();
    await this.fire('compiler-watch-after', file,items);
  }

  //动态添加执行
  async addEntryCompiler(entry) {
    const addEntry = Util.getEntry(entry);
    const entrys = this.entrys;
    let addEntrys = {};
    Object.keys(addEntry).forEach((item)=>{
      if(entrys[item] && JSON.stringify(entrys[item].paths) !== JSON.stringify(addEntry[item].paths)){

      }else{
        addEntrys[item] = addEntry[item];
      }
    });
    if(!Object.keys(addEntrys).length) return;
    const entrysPaths = Util.getEntryPaths(entrys);
    let addEntrysPaths =Util.getEntryPaths(addEntrys);
    addEntrysPaths = addEntrysPaths.filter((item)=>{
      return entrysPaths.indexOf(item) === -1
    });
    //addEntry.
    this.entrys = Object.assign(this.entrys, addEntrys);
    this.chunks = Object.assign(this.chunks, Util.getChunks(addEntrys));
    this.entryFiles = entrysPaths;
    await this._compiler(addEntrysPaths || []);
    this.fire('add-entry-compiler-after', entry);
  }

  //动态移除entery
  async removeEntryCompiler(entry) {
    let entrys = this.entrys;
    let item = entrys[entry];
    if (item){
      delete entrys[entry];
      this.entryFiles = Util.getEntryPaths(entry);
      delete this.chunks[entry];
      item = null;
      //todo modules 内容不判断先不删除
      this.fire('remove-entry-compiler-after', entry)
    }
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
      const uses = Util.fixOptions(loader.use, 'loader');
      let newUses = [];
      uses.forEach((item) => {
        item.loader && newUses.push(item.loader.bind(this, moduleObj, item.options, this.options))
      });
      await Util.queueExec(newUses)
    }
  }
}

module.exports = Compiler;
